import {
  z,
  ZodObject,
  ZodString,
  ZodTypeAny,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodArray,
} from "zod";
import { QueryAbilities, OPERATORS, OPERATOR_MAP } from "./types";
import { IFieldDefinition, FieldTypeEnum } from "./types";
// extract zod type
function getZodTypeName(schema: ZodTypeAny): string {
  if (schema instanceof ZodArray) {
    const elementType = schema.element;
    if (elementType instanceof ZodString) return "string[]";
    if (elementType instanceof ZodNumber) return "number[]";
    if (elementType instanceof ZodBoolean) return "boolean[]";
    if (elementType instanceof ZodDate) return "date[]";
    return "array";
  }
  if (schema instanceof ZodString) return "string";
  if (schema instanceof ZodNumber) return "number";
  if (schema instanceof ZodBoolean) return "boolean";
  if (schema instanceof ZodDate) return "date";
  if (schema instanceof ZodObject) return "object";

  return "unknown";
}

export function getQueryAbilities(
  schema: ZodObject<any>,
  maxDepth: number = Infinity,
  parentKey: string = "",
  currentDepth: number = 0
): QueryAbilities {
  const shape = schema.shape;
  const result: QueryAbilities = {};

  if (currentDepth >= maxDepth) return result;

  for (const key in shape) {
    const fieldSchema = shape[key];
    const typeName = getZodTypeName(fieldSchema);

    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    // Nested object case
    if (typeName === "object") {
      Object.assign(
        result,
        getQueryAbilities(fieldSchema, maxDepth, fullKey, currentDepth + 1)
      );
      continue;
    }

    // Primitive field
    result[fullKey] = {
      type: typeName,
      supportedOperators: OPERATORS[typeName] ?? ["eq"],
    };
  }

  return result;
}

function parseValueByType(type: string, value: any): any {
  // For array types, parse based on the element type
  const elementType = type.endsWith("[]") ? type.slice(0, -2) : type;

  switch (elementType) {
    case "number":
      return Number(value);

    case "boolean":
      return value === "true" || value === true;

    case "date":
      return new Date(value);

    case "string":
    default:
      return String(value);
  }
}

/**
 * Convert a single field, operator, and value into a MongoDB query object.
 *
 * Example:
 *   convertToMongoQuery("age", "gte", 18)
 *   => { age: { $gte: 18 } }
 */
export function convertToMongoQuery(
  field: string,
  operator: string,
  value: any,
  type: string // <-- type comes from getQueryAbilities()
): Record<string, any> {
  const parsedValue = parseValueByType(type, value);

  // eq → short syntax
  if (!operator || operator === "eq") {
    return { [field]: parsedValue };
  }

  // text search special handling
  if (operator === "search") {
    // For array types, use $elemMatch to search within array elements
    if (type.endsWith("[]")) {
      return {
        [field]: {
          $elemMatch: {
            $regex: parsedValue,
            $options: "i", // <-- case insensitive search
          },
        },
      };
    }
    // For regular string fields
    return {
      [field]: {
        $regex: parsedValue,
        $options: "i", // <-- case insensitive search
      },
    };
  }

  const mongoOp = OPERATOR_MAP[operator];
  if (!mongoOp) {
    throw new Error(`Unsupported operator: ${operator}`);
  }

  // array operators
  if (["in", "nin"].includes(operator)) {
    const parsedArray = Array.isArray(value)
      ? value.map((v) => parseValueByType(type, v))
      : typeof value === "string" && value.includes(",")
      ? value.split(",").map((v) => parseValueByType(type, v.trim()))
      : String(parsedValue)
          .split(",")
          .map((v) => parseValueByType(type, v.trim()));

    return {
      [field]: {
        [mongoOp]: parsedArray,
      },
    };
  }

  // normal operators
  return {
    [field]: {
      [mongoOp]: parsedValue,
    },
  };
}

const rootFieldToZodSchema = (rootField: IFieldDefinition, maxLevel = 3) => {
  const zodSchema: Record<string, z.ZodTypeAny> = {};
  console.log("rootField.fields", rootField);
  if (!rootField.fields || maxLevel <= 0) {
    return zodSchema;
  }

  const convertFieldToZod = (
    field: IFieldDefinition,
    currentLevel: number
  ): z.ZodTypeAny => {
    if (currentLevel <= 0) {
      return z.any();
    }

    const fieldName = field.populateData?.path || field.name;
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case FieldTypeEnum.STRING:
      case FieldTypeEnum.RICH_TEXT:
        schema = z.string();
        break;

      case FieldTypeEnum.NUMBER:
        schema = z.number();
        break;

      case FieldTypeEnum.BOOLEAN:
        schema = z.boolean();
        break;

      case FieldTypeEnum.DATE:
        schema = z.coerce.date();
        break;

      case FieldTypeEnum.ENUM:
        if (field.enumValues) {
          const enumValues = Object.keys(field.enumValues);
          schema = z.enum(enumValues as [string, ...string[]]);
        } else {
          schema = z.string();
        }
        break;

      case FieldTypeEnum.EMBEDDED_DOCUMENT:
      case FieldTypeEnum.ARRAY_EMBEDDED_DOCUMENTS:
        if (
          field.populateData?.referencePopulated?.fields &&
          field.populateData.referencePopulated.fields.length > 0
        ) {
          const nestedSchema: Record<string, z.ZodTypeAny> = {};
          for (const subField of field.populateData.referencePopulated.fields) {
            const subFieldName = subField.populateData?.path || subField.name;
            let subFieldSchema = convertFieldToZod(subField, currentLevel - 1);
            // if (!subField.required) {
            //   subFieldSchema = subFieldSchema.optional();
            // }
            nestedSchema[subFieldName] = subFieldSchema;
          }
          if (field.type === FieldTypeEnum.EMBEDDED_DOCUMENT) {
            schema = z.object(nestedSchema);
          } else {
            schema = z.array(z.object(nestedSchema));
          }
        } else {
          schema = z.array(z.any());
        }
        break;

      case FieldTypeEnum.ARRAY_REFERENCE:
        schema = z.array(z.string());
        break;

      case FieldTypeEnum.REFERENCE:
        schema = z.string();
        break;

      case FieldTypeEnum.COMPUTATION:
        // Computation fields are typically read-only, use any or the computed type
        schema = z.any();
        break;

      default:
        schema = z.any();
    }

    // Apply optional if field is not required (Zod schemas are required by default)
    if (!field.required) {
      schema = schema.optional();
    }

    if (field.description) {
      schema = schema.describe(field.description);
    }

    return schema;
  };

  for (const subField of rootField.fields) {
    const fieldName = subField.populateData?.path || subField.name;
    zodSchema[fieldName] = convertFieldToZod(subField, maxLevel);
  }

  return zodSchema;
};

export function rootFieldToZodSchemaFromString(rootField: string) {
  return rootFieldToZodSchema(JSON.parse(rootField));
}
