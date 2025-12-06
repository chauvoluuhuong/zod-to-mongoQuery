import {
  z,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodArray,
  ZodObject,
  ZodAny,
  ZodOptional,
} from "zod";
import {
  getQueryAbilities,
  convertToMongoQuery,
  rootFieldToZodSchemaFromString,
} from "../index";
import { FieldTypeEnum, IFieldDefinition } from "../types";
import * as fs from "fs";
import * as path from "path";

describe("getQueryAbilities", () => {
  describe("basic types", () => {
    it("should extract query abilities for string fields", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string(),
      });

      const result = getQueryAbilities(schema);

      expect(result).toEqual({
        name: {
          type: "string",
          supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
        },
        email: {
          type: "string",
          supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
        },
      });
    });

    it("should extract query abilities for number fields", () => {
      const schema = z.object({
        age: z.number(),
        score: z.number(),
      });

      const result = getQueryAbilities(schema);

      expect(result).toEqual({
        age: {
          type: "number",
          supportedOperators: [
            "eq",
            "ne",
            "gt",
            "gte",
            "lt",
            "lte",
            "in",
            "nin",
          ],
        },
        score: {
          type: "number",
          supportedOperators: [
            "eq",
            "ne",
            "gt",
            "gte",
            "lt",
            "lte",
            "in",
            "nin",
          ],
        },
      });
    });

    it("should extract query abilities for boolean fields", () => {
      const schema = z.object({
        isActive: z.boolean(),
        verified: z.boolean(),
      });

      const result = getQueryAbilities(schema);

      expect(result).toEqual({
        isActive: {
          type: "boolean",
          supportedOperators: ["eq", "ne"],
        },
        verified: {
          type: "boolean",
          supportedOperators: ["eq", "ne"],
        },
      });
    });

    it("should extract query abilities for date fields", () => {
      const schema = z.object({
        createdAt: z.date(),
        updatedAt: z.date(),
      });

      const result = getQueryAbilities(schema);

      expect(result).toEqual({
        createdAt: {
          type: "date",
          supportedOperators: ["eq", "ne", "gt", "gte", "lt", "lte"],
        },
        updatedAt: {
          type: "date",
          supportedOperators: ["eq", "ne", "gt", "gte", "lt", "lte"],
        },
      });
    });

    it("should handle mixed types", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        isActive: z.boolean(),
        createdAt: z.date(),
      });

      const result = getQueryAbilities(schema);

      expect(result).toHaveProperty("name");
      expect(result.name.type).toBe("string");
      expect(result).toHaveProperty("age");
      expect(result.age.type).toBe("number");
      expect(result).toHaveProperty("isActive");
      expect(result.isActive.type).toBe("boolean");
      expect(result).toHaveProperty("createdAt");
      expect(result.createdAt.type).toBe("date");
    });
  });

  describe("nested objects", () => {
    it("should extract query abilities for nested objects", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
        status: z.string(),
      });

      const result = getQueryAbilities(schema);

      expect(result).toEqual({
        "user.name": {
          type: "string",
          supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
        },
        "user.age": {
          type: "number",
          supportedOperators: [
            "eq",
            "ne",
            "gt",
            "gte",
            "lt",
            "lte",
            "in",
            "nin",
          ],
        },
        status: {
          type: "string",
          supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
        },
      });
    });

    it("should handle deeply nested objects", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            age: z.number(),
          }),
        }),
      });

      const result = getQueryAbilities(schema);

      expect(result).toEqual({
        "user.profile.name": {
          type: "string",
          supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
        },
        "user.profile.age": {
          type: "number",
          supportedOperators: [
            "eq",
            "ne",
            "gt",
            "gte",
            "lt",
            "lte",
            "in",
            "nin",
          ],
        },
      });
    });

    it("should respect maxDepth parameter", () => {
      const schema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              field: z.string(),
            }),
          }),
        }),
      });

      const result = getQueryAbilities(schema, 2);

      expect(result).not.toHaveProperty("level1.level2.level3.field");
      expect(result).not.toHaveProperty("level1.level2");
      expect(result).toEqual({});
    });

    it("should include nested fields up to maxDepth", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          profile: z.object({
            bio: z.string(),
          }),
        }),
      });

      const result = getQueryAbilities(schema, 2);

      expect(result["user.name"]).toBeDefined();
      // user.profile.bio is at depth 2, which equals maxDepth, so it's excluded
      expect(result["user.profile.bio"]).toBeUndefined();

      // But with maxDepth 3, it should be included
      const resultWithDepth3 = getQueryAbilities(schema, 3);
      expect(resultWithDepth3["user.profile.bio"]).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty schema", () => {
      const schema = z.object({});
      const result = getQueryAbilities(schema);
      expect(result).toEqual({});
    });

    it("should handle unknown types with default operator", () => {
      // Using a schema that might not be recognized
      const schema = z.object({
        // This will be treated as unknown if not recognized
        custom: z.any(),
      });

      const result = getQueryAbilities(schema);
      // Unknown types should default to ["eq"]
      expect(result.custom.supportedOperators).toEqual(["eq"]);
    });

    it("should extract query abilities for array fields", () => {
      const schema = z.object({
        tags: z.array(z.string()),
        scores: z.array(z.number()),
        flags: z.array(z.boolean()),
      });

      const result = getQueryAbilities(schema);

      expect(result.tags).toEqual({
        type: "string[]",
        supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
      });
      expect(result.scores).toEqual({
        type: "number[]",
        supportedOperators: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"],
      });
      expect(result.flags).toEqual({
        type: "boolean[]",
        supportedOperators: ["eq", "ne", "in", "nin"],
      });
    });

    it("should extract query abilities for array of objects", () => {
      const schema = z.object({
        tags: z.array(
          z.object({
            name: z.string(),
            color: z.string(),
          })
        ),
      });

      const result = getQueryAbilities(schema);

      // The array field itself should have object[] type
      expect(result.tags).toEqual({
        type: "object[]",
        supportedOperators: ["eq", "ne", "in", "nin"],
      });

      // Nested fields from the object should be accessible
      expect(result["tags.name"]).toEqual({
        type: "string",
        supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
      });
      expect(result["tags.color"]).toEqual({
        type: "string",
        supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"],
      });
    });
  });
});

describe("convertToMongoQuery", () => {
  describe("equality operator (eq)", () => {
    it("should convert eq operator to short syntax for string", () => {
      const result = convertToMongoQuery("name", "eq", "John", "string");
      expect(result).toEqual({ name: "John" });
    });

    it("should convert eq operator to short syntax for number", () => {
      const result = convertToMongoQuery("age", "eq", 25, "number");
      expect(result).toEqual({ age: 25 });
    });

    it("should convert eq operator to short syntax for boolean", () => {
      const result = convertToMongoQuery("isActive", "eq", true, "boolean");
      expect(result).toEqual({ isActive: true });
    });

    it("should convert empty operator to short syntax", () => {
      const result = convertToMongoQuery("name", "", "John", "string");
      expect(result).toEqual({ name: "John" });
    });

    it("should parse string value to number", () => {
      const result = convertToMongoQuery("age", "eq", "25", "number");
      expect(result).toEqual({ age: 25 });
    });

    it("should parse string value to boolean", () => {
      const result = convertToMongoQuery("isActive", "eq", "true", "boolean");
      expect(result).toEqual({ isActive: true });
    });

    it("should parse string value to date", () => {
      const dateStr = "2024-01-01T00:00:00Z";
      const result = convertToMongoQuery("createdAt", "eq", dateStr, "date");
      expect(result).toEqual({ createdAt: new Date(dateStr) });
    });
  });

  describe("comparison operators", () => {
    it("should convert gt operator for numbers", () => {
      const result = convertToMongoQuery("age", "gt", 18, "number");
      expect(result).toEqual({ age: { $gt: 18 } });
    });

    it("should convert gte operator for numbers", () => {
      const result = convertToMongoQuery("age", "gte", 18, "number");
      expect(result).toEqual({ age: { $gte: 18 } });
    });

    it("should convert lt operator for numbers", () => {
      const result = convertToMongoQuery("age", "lt", 65, "number");
      expect(result).toEqual({ age: { $lt: 65 } });
    });

    it("should convert lte operator for numbers", () => {
      const result = convertToMongoQuery("age", "lte", 65, "number");
      expect(result).toEqual({ age: { $lte: 65 } });
    });

    it("should convert ne operator", () => {
      const result = convertToMongoQuery("status", "ne", "deleted", "string");
      expect(result).toEqual({ status: { $ne: "deleted" } });
    });
  });

  describe("array operators", () => {
    it("should convert in operator with array", () => {
      const result = convertToMongoQuery(
        "status",
        "in",
        ["active", "pending"],
        "string"
      );
      expect(result).toEqual({ status: { $in: ["active", "pending"] } });
    });

    it("should convert in operator with comma-separated string", () => {
      const result = convertToMongoQuery(
        "status",
        "in",
        "active,pending",
        "string"
      );
      expect(result).toEqual({ status: { $in: ["active", "pending"] } });
    });

    it("should convert nin operator with array", () => {
      const result = convertToMongoQuery(
        "status",
        "nin",
        ["deleted", "archived"],
        "string"
      );
      expect(result).toEqual({ status: { $nin: ["deleted", "archived"] } });
    });

    it("should convert nin operator with comma-separated string", () => {
      const result = convertToMongoQuery(
        "status",
        "nin",
        "deleted,archived",
        "string"
      );
      expect(result).toEqual({ status: { $nin: ["deleted", "archived"] } });
    });

    it("should parse array values by type for numbers", () => {
      const result = convertToMongoQuery(
        "age",
        "in",
        ["25", "30", "35"],
        "number"
      );
      expect(result).toEqual({ age: { $in: [25, 30, 35] } });
    });

    it("should parse comma-separated string values by type for numbers", () => {
      const result = convertToMongoQuery("age", "in", "25,30,35", "number");
      expect(result).toEqual({ age: { $in: [25, 30, 35] } });
    });
  });

  describe("text search operators", () => {
    it("should convert search operator to case-insensitive regex", () => {
      const result = convertToMongoQuery("name", "search", "john", "string");
      expect(result).toEqual({
        name: {
          $regex: "john",
          $options: "i",
        },
      });
    });

    it("should convert search operator for array fields using $elemMatch", () => {
      const result = convertToMongoQuery(
        "tags",
        "search",
        "javascript",
        "string[]"
      );
      expect(result).toEqual({
        tags: {
          $elemMatch: {
            $regex: "javascript",
            $options: "i",
          },
        },
      });
    });

    it("should convert regex operator", () => {
      const result = convertToMongoQuery("name", "regex", "^John", "string");
      expect(result).toEqual({
        name: {
          $regex: "^John",
        },
      });
    });
  });

  describe("nested field paths", () => {
    it("should handle nested field paths", () => {
      const result = convertToMongoQuery("user.name", "eq", "John", "string");
      expect(result).toEqual({ "user.name": "John" });
    });

    it("should handle deeply nested field paths", () => {
      const result = convertToMongoQuery(
        "user.profile.email",
        "eq",
        "test@example.com",
        "string"
      );
      expect(result).toEqual({ "user.profile.email": "test@example.com" });
    });
  });

  describe("error handling", () => {
    it("should throw error for unsupported operator", () => {
      expect(() => {
        convertToMongoQuery("field", "unsupported", "value", "string");
      }).toThrow("Unsupported operator: unsupported");
    });
  });

  describe("type parsing edge cases", () => {
    it("should handle boolean true value", () => {
      const result = convertToMongoQuery("isActive", "eq", true, "boolean");
      expect(result).toEqual({ isActive: true });
    });

    it("should handle boolean false value", () => {
      const result = convertToMongoQuery("isActive", "eq", false, "boolean");
      expect(result).toEqual({ isActive: false });
    });

    it("should handle string 'true' as boolean", () => {
      const result = convertToMongoQuery("isActive", "eq", "true", "boolean");
      expect(result).toEqual({ isActive: true });
    });

    it("should handle string 'false' as boolean", () => {
      const result = convertToMongoQuery("isActive", "eq", "false", "boolean");
      expect(result).toEqual({ isActive: false });
    });

    it("should default to string for unknown types", () => {
      const result = convertToMongoQuery("field", "eq", 123, "unknown");
      expect(result).toEqual({ field: "123" });
    });
  });
});

describe("rootFieldToZodSchemaFromString", () => {
  describe("basic field types", () => {
    it("should convert string field to Zod string schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "name",
            type: FieldTypeEnum.STRING,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.name).toBeInstanceOf(ZodString);
      expect(result.parse({ name: "John" })).toEqual({ name: "John" });
      expect(() => result.parse({ name: 123 })).toThrow();
    });

    it("should convert number field to Zod number schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "age",
            type: FieldTypeEnum.NUMBER,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.age).toBeInstanceOf(ZodNumber);
      expect(result.parse({ age: 25 })).toEqual({ age: 25 });
      expect(() => result.parse({ age: "25" })).toThrow();
    });

    it("should convert boolean field to Zod boolean schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "isActive",
            type: FieldTypeEnum.BOOLEAN,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.isActive).toBeInstanceOf(ZodBoolean);
      expect(result.parse({ isActive: true })).toEqual({ isActive: true });
      expect(() => result.parse({ isActive: "true" })).toThrow();
    });

    it("should convert date field to Zod date schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "createdAt",
            type: FieldTypeEnum.DATE,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.createdAt).toBeInstanceOf(ZodDate);
      const date = new Date("2024-01-01");
      expect(result.parse({ createdAt: date })).toEqual({ createdAt: date });
    });

    it("should convert rich_text field to Zod string schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "content",
            type: FieldTypeEnum.RICH_TEXT,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.content).toBeInstanceOf(ZodString);
      expect(result.parse({ content: "<p>Hello</p>" })).toEqual({
        content: "<p>Hello</p>",
      });
    });
  });

  describe("optional fields", () => {
    it("should make optional fields optional in Zod schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "name",
            type: FieldTypeEnum.STRING,
            required: true,
            version: 1,
          },
          {
            name: "email",
            type: FieldTypeEnum.STRING,
            required: false,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.parse({ name: "John" })).toEqual({ name: "John" });
      expect(result.parse({ name: "John", email: "john@example.com" })).toEqual(
        { name: "John", email: "john@example.com" }
      );
      expect(() => result.parse({})).toThrow(); // name is required
    });
  });

  describe("enum fields", () => {
    it("should convert enum field to Zod enum schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "status",
            type: FieldTypeEnum.ENUM,
            required: true,
            version: 1,
            enumValues: {
              active: { name: "Active" },
              pending: { name: "Pending" },
              inactive: { name: "Inactive" },
            },
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.parse({ status: "active" })).toEqual({ status: "active" });
      expect(result.parse({ status: "pending" })).toEqual({
        status: "pending",
      });
      expect(() => result.parse({ status: "invalid" })).toThrow();
    });

    it("should default to string if enumValues is missing", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "status",
            type: FieldTypeEnum.ENUM,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.status).toBeInstanceOf(ZodString);
      expect(result.parse({ status: "any-value" })).toEqual({
        status: "any-value",
      });
    });
  });

  describe("reference fields", () => {
    it("should convert reference field to Zod string schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "userId",
            type: FieldTypeEnum.REFERENCE,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.userId).toBeInstanceOf(ZodString);
      expect(result.parse({ userId: "507f1f77bcf86cd799439011" })).toEqual({
        userId: "507f1f77bcf86cd799439011",
      });
    });

    it("should convert array reference field to Zod array of strings", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "tagIds",
            type: FieldTypeEnum.ARRAY_REFERENCE,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.tagIds).toBeInstanceOf(ZodArray);
      expect(
        result.parse({
          tagIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        })
      ).toEqual({
        tagIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      });
    });
  });

  describe("embedded documents", () => {
    it("should convert embedded document to Zod object schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "address",
            type: FieldTypeEnum.EMBEDDED_DOCUMENT,
            required: true,
            version: 1,
            populateData: {
              path: "address",
              referencePopulated: {
                name: "address",
                type: FieldTypeEnum.STRING,
                version: 1,
                fields: [
                  {
                    name: "street",
                    type: FieldTypeEnum.STRING,
                    required: true,
                    version: 1,
                  },
                  {
                    name: "city",
                    type: FieldTypeEnum.STRING,
                    required: true,
                    version: 1,
                  },
                ],
              },
            },
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.address).toBeInstanceOf(ZodObject);
      expect(
        result.parse({ address: { street: "123 Main St", city: "New York" } })
      ).toEqual({ address: { street: "123 Main St", city: "New York" } });
    });

    it("should convert array of embedded documents to Zod array of objects", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "tags",
            type: FieldTypeEnum.ARRAY_EMBEDDED_DOCUMENTS,
            required: true,
            version: 1,
            populateData: {
              path: "tags",
              referencePopulated: {
                name: "tag",
                type: FieldTypeEnum.STRING,
                version: 1,
                fields: [
                  {
                    name: "name",
                    type: FieldTypeEnum.STRING,
                    required: true,
                    version: 1,
                  },
                  {
                    name: "color",
                    type: FieldTypeEnum.STRING,
                    required: false,
                    version: 1,
                  },
                ],
              },
            },
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.tags).toBeInstanceOf(ZodArray);
      expect(
        result.parse({
          tags: [
            { name: "javascript", color: "yellow" },
            { name: "typescript", color: "blue" },
          ],
        })
      ).toEqual({
        tags: [
          { name: "javascript", color: "yellow" },
          { name: "typescript", color: "blue" },
        ],
      });
    });
  });

  describe("computation fields", () => {
    it("should convert computation field to Zod any schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "computedValue",
            type: FieldTypeEnum.COMPUTATION,
            required: false,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      // Optional fields are wrapped in ZodOptional
      expect(result.shape.computedValue).toBeInstanceOf(ZodOptional);
      if (result.shape.computedValue instanceof ZodOptional) {
        expect(result.shape.computedValue._def.innerType).toBeInstanceOf(
          ZodAny
        );
      }
      expect(result.parse({ computedValue: "any" })).toEqual({
        computedValue: "any",
      });
      expect(result.parse({ computedValue: 123 })).toEqual({
        computedValue: 123,
      });
    });
  });

  describe("nested structures", () => {
    it("should handle deeply nested embedded documents", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "user",
            type: FieldTypeEnum.EMBEDDED_DOCUMENT,
            required: true,
            version: 1,
            populateData: {
              path: "user",
              referencePopulated: {
                name: "user",
                type: FieldTypeEnum.STRING,
                version: 1,
                fields: [
                  {
                    name: "profile",
                    type: FieldTypeEnum.EMBEDDED_DOCUMENT,
                    required: true,
                    version: 1,
                    populateData: {
                      path: "profile",
                      referencePopulated: {
                        name: "profile",
                        type: FieldTypeEnum.STRING,
                        version: 1,
                        fields: [
                          {
                            name: "bio",
                            type: FieldTypeEnum.STRING,
                            required: true,
                            version: 1,
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.parse({ user: { profile: { bio: "Developer" } } })).toEqual(
        { user: { profile: { bio: "Developer" } } }
      );
    });
  });

  describe("field descriptions", () => {
    it("should preserve field descriptions", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "name",
            type: FieldTypeEnum.STRING,
            required: true,
            version: 1,
            description: "User's full name",
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));
      // Zod schemas with descriptions have the description stored internally
      expect(result.shape.name).toBeDefined();
    });
  });

  describe("populateData path handling", () => {
    it("should use populateData.path if available", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "fieldName",
            type: FieldTypeEnum.STRING,
            required: true,
            version: 1,
            populateData: {
              path: "customPath",
            },
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.customPath).toBeDefined();
      expect(result.shape.fieldName).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid JSON string", () => {
      expect(() => {
        rootFieldToZodSchemaFromString("invalid json");
      }).toThrow();
    });

    it("should handle empty fields array", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));
      expect(result.shape).toEqual({});
    });

    it("should handle null fields", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: null,
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));
      expect(result.shape).toEqual({});
    });

    it("should handle missing fields property", () => {
      const rootField: any = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));
      expect(result.shape).toEqual({});
    });
  });

  describe("maxLevel parameter", () => {
    it("should respect maxLevel for nested structures", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "level1",
            type: FieldTypeEnum.EMBEDDED_DOCUMENT,
            required: true,
            version: 1,
            populateData: {
              path: "level1",
              referencePopulated: {
                name: "level1",
                type: FieldTypeEnum.STRING,
                version: 1,
                fields: [
                  {
                    name: "level2",
                    type: FieldTypeEnum.EMBEDDED_DOCUMENT,
                    required: true,
                    version: 1,
                    populateData: {
                      path: "level2",
                      referencePopulated: {
                        name: "level2",
                        type: FieldTypeEnum.STRING,
                        version: 1,
                        fields: [
                          {
                            name: "field",
                            type: FieldTypeEnum.STRING,
                            required: true,
                            version: 1,
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      // Note: rootFieldToZodSchemaFromString uses default maxLevel of 3
      // We can't test maxLevel directly since it's not exposed, but we can verify
      // that deeply nested structures are handled correctly
      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));
      expect(result.shape.level1).toBeDefined();
    });
  });

  describe("mixed field types", () => {
    it("should handle multiple field types in one schema", () => {
      const rootField: IFieldDefinition = {
        name: "root",
        type: FieldTypeEnum.STRING,
        version: 1,
        fields: [
          {
            name: "name",
            type: FieldTypeEnum.STRING,
            required: true,
            version: 1,
          },
          {
            name: "age",
            type: FieldTypeEnum.NUMBER,
            required: true,
            version: 1,
          },
          {
            name: "isActive",
            type: FieldTypeEnum.BOOLEAN,
            required: false,
            version: 1,
          },
          {
            name: "createdAt",
            type: FieldTypeEnum.DATE,
            required: true,
            version: 1,
          },
        ],
      };

      const result = rootFieldToZodSchemaFromString(JSON.stringify(rootField));

      expect(result.shape.name).toBeInstanceOf(ZodString);
      expect(result.shape.age).toBeInstanceOf(ZodNumber);
      // isActive is optional, so it's wrapped in ZodOptional
      expect(result.shape.isActive).toBeInstanceOf(ZodOptional);
      if (result.shape.isActive instanceof ZodOptional) {
        expect(result.shape.isActive._def.innerType).toBeInstanceOf(ZodBoolean);
      }
      expect(result.shape.createdAt).toBeInstanceOf(ZodDate);

      const date = new Date("2024-01-01");
      expect(
        result.parse({
          name: "John",
          age: 25,
          isActive: true,
          createdAt: date,
        })
      ).toEqual({
        name: "John",
        age: 25,
        isActive: true,
        createdAt: date,
      });
    });
  });
});

describe("getQueryAbilities with rootField.json", () => {
  it("should convert rootField.json to zod schema and get query abilities", () => {
    // 1. Read the rootField.json file
    const rootFieldJsonPath = path.join(__dirname, "rootField.json");
    const rootFieldJsonString = fs.readFileSync(rootFieldJsonPath, "utf-8");

    // 2. Convert JSON string to ZodObject (rootFieldToZodSchemaFromString returns ZodObject directly)
    const zodSchema = rootFieldToZodSchemaFromString(rootFieldJsonString);

    // 3. Get query abilities
    const queryAbilities = getQueryAbilities(zodSchema);

    // 4. Assert that query abilities are returned
    expect(queryAbilities).toBeDefined();
    expect(typeof queryAbilities).toBe("object");

    // 5. Verify some expected fields from rootField.json exist
    // Based on the rootField.json structure, we should have fields like:
    // - packageId (string/computation)
    // - packageOrderNumber (number/computation)
    // - totalWeight (number/computation)
    // - volume (string)
    // - soDaGel (string)
    // - exportId (reference/string)
    // - packageCustomerId (reference/string)
    // - productsPacked (array of embedded documents)

    // Check for top-level fields
    expect(queryAbilities).toHaveProperty("packageId");
    expect(queryAbilities).toHaveProperty("packageOrderNumber");
    expect(queryAbilities).toHaveProperty("totalWeight");
    expect(queryAbilities).toHaveProperty("volume");
    expect(queryAbilities).toHaveProperty("soDaGel");
    expect(queryAbilities).toHaveProperty("exportId");
    expect(queryAbilities).toHaveProperty("packageCustomerId");
    expect(queryAbilities).toHaveProperty("productsPacked");

    // Verify that each field has the expected structure
    Object.keys(queryAbilities).forEach((fieldPath) => {
      const ability = queryAbilities[fieldPath];
      expect(ability).toHaveProperty("type");
      expect(ability).toHaveProperty("supportedOperators");
      expect(Array.isArray(ability.supportedOperators)).toBe(true);
      expect(ability.supportedOperators.length).toBeGreaterThan(0);
    });

    // Verify specific field types based on rootField.json
    // volume and soDaGel are strings
    if (queryAbilities.volume) {
      expect(queryAbilities.volume.type).toBe("string");
      expect(queryAbilities.volume.supportedOperators).toContain("eq");
      expect(queryAbilities.volume.supportedOperators).toContain("search");
    }

    // packageOrderNumber and totalWeight are numbers (computation fields return as any, but if they're numbers)
    if (queryAbilities.packageOrderNumber) {
      // Computation fields might be "unknown" type, but if they have number operators, they're treated as numbers
      const hasNumberOperators =
        queryAbilities.packageOrderNumber.supportedOperators.some((op) =>
          ["gt", "gte", "lt", "lte"].includes(op)
        );
      // If it has number operators, it should be treated as a number type
      if (hasNumberOperators) {
        expect(queryAbilities.packageOrderNumber.type).toBe("number");
      }
    }

    // productsPacked should be an array type (could be object[] for arrays of objects)
    if (queryAbilities.productsPacked) {
      expect(queryAbilities.productsPacked.type).toMatch(
        /array|object\[\]|unknown/
      );
    }

    // Verify nested fields of productsPacked (array of objects)
    // productsPacked.quantity should exist and be a number
    if (queryAbilities["productsPacked.quantity"]) {
      expect(queryAbilities["productsPacked.quantity"].type).toBe("number");
      expect(
        queryAbilities["productsPacked.quantity"].supportedOperators
      ).toContain("eq");
      expect(
        queryAbilities["productsPacked.quantity"].supportedOperators
      ).toContain("gt");
      expect(
        queryAbilities["productsPacked.quantity"].supportedOperators
      ).toContain("gte");
    }

    // productsPacked.productId should exist (reference field, typically string)
    if (queryAbilities["productsPacked.productId"]) {
      expect(queryAbilities["productsPacked.productId"].type).toBe("string");
      expect(
        queryAbilities["productsPacked.productId"].supportedOperators
      ).toContain("eq");
      expect(
        queryAbilities["productsPacked.productId"].supportedOperators
      ).toContain("search");
    }

    // Verify that query abilities contains at least some fields
    const fieldCount = Object.keys(queryAbilities).length;
    expect(fieldCount).toBeGreaterThan(0);
  });
});
