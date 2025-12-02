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
