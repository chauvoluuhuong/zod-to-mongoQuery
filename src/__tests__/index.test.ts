import { z } from "zod";
import { getQueryAbilities, convertToMongoQuery } from "../index";

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
