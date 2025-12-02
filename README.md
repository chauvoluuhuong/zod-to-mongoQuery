# zod-to-mongoQuery

A utility library that converts Zod schemas to MongoDB query capabilities and builds MongoDB queries. Perfect for AI models to suggest searchable fields and their supported operators, then build queries accordingly.

## Installation

```bash
npm install zod-to-mongoquery
```

## Features

1. **Generate query abilities**: Extract searchable fields and their supported operators from Zod schemas
2. **Build MongoDB queries**: Convert field, operator, and value combinations into MongoDB query objects with proper type parsing

## Usage

### 1. Get Query Abilities from Zod Schema

Use `getQueryAbilities()` to discover what fields can be searched and which operators are supported:

```typescript
import { z } from "zod";
import { getQueryAbilities } from "zod-to-mongoquery";

// Define your schema
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

// Get query abilities
const abilities = getQueryAbilities(userSchema);

console.log(abilities);
// {
//   name: {
//     type: "string",
//     supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"]
//   },
//   age: {
//     type: "number",
//     supportedOperators: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"]
//   },
//   email: {
//     type: "string",
//     supportedOperators: ["eq", "ne", "in", "nin", "regex", "search"]
//   },
//   isActive: {
//     type: "boolean",
//     supportedOperators: ["eq", "ne"]
//   },
//   createdAt: {
//     type: "date",
//     supportedOperators: ["eq", "ne", "gt", "gte", "lt", "lte"]
//   }
// }
```

### 2. Nested Objects

The library supports nested objects with dot-notation field paths:

```typescript
const schema = z.object({
  user: z.object({
    name: z.string(),
    age: z.number(),
    profile: z.object({
      bio: z.string(),
    }),
  }),
  status: z.string(),
});

const abilities = getQueryAbilities(schema);

console.log(abilities);
// {
//   "user.name": { type: "string", supportedOperators: [...] },
//   "user.age": { type: "number", supportedOperators: [...] },
//   "user.profile.bio": { type: "string", supportedOperators: [...] },
//   status: { type: "string", supportedOperators: [...] }
// }
```

### 3. Limit Depth

Control how deep to traverse nested objects:

```typescript
const abilities = getQueryAbilities(schema, 2); // Only go 2 levels deep
```

### 4. Build MongoDB Queries

Use `convertToMongoQuery()` to build MongoDB query objects:

```typescript
import { convertToMongoQuery } from "zod-to-mongoquery";

// Equality (short syntax)
convertToMongoQuery("name", "eq", "John", "string");
// { name: "John" }

// Comparison operators
convertToMongoQuery("age", "gte", 18, "number");
// { age: { $gte: 18 } }

convertToMongoQuery("age", "lt", 65, "number");
// { age: { $lt: 65 } }

// Array operators
convertToMongoQuery("status", "in", ["active", "pending"], "string");
// { status: { $in: ["active", "pending"] } }

convertToMongoQuery("status", "in", "active,pending", "string");
// { status: { $in: ["active", "pending"] } }

// Text search (case-insensitive)
convertToMongoQuery("name", "search", "john", "string");
// { name: { $regex: "john", $options: "i" } }

// Nested fields
convertToMongoQuery("user.name", "eq", "John", "string");
// { "user.name": "John" }
```

### 5. Complete Workflow Example

Here's a complete example showing how to use both functions together:

```typescript
import { z } from "zod";
import { getQueryAbilities, convertToMongoQuery } from "zod-to-mongoquery";

// 1. Define your schema
const productSchema = z.object({
  name: z.string(),
  price: z.number(),
  category: z.string(),
  inStock: z.boolean(),
  createdAt: z.date(),
});

// 2. Get query abilities (for AI suggestions)
const abilities = getQueryAbilities(productSchema);

// 3. User wants to search for products:
//    - Name contains "laptop" (case-insensitive)
//    - Price between 500 and 2000
//    - Category is "electronics" or "computers"
//    - In stock

const queries = [
  convertToMongoQuery("name", "search", "laptop", abilities.name.type),
  convertToMongoQuery("price", "gte", 500, abilities.price.type),
  convertToMongoQuery("price", "lte", 2000, abilities.price.type),
  convertToMongoQuery(
    "category",
    "in",
    "electronics,computers",
    abilities.category.type
  ),
  convertToMongoQuery("inStock", "eq", true, abilities.inStock.type),
];

// 4. Combine into final MongoDB query
const mongoQuery = {
  $and: queries,
};

console.log(mongoQuery);
// {
//   $and: [
//     { name: { $regex: "laptop", $options: "i" } },
//     { price: { $gte: 500 } },
//     { price: { $lte: 2000 } },
//     { category: { $in: ["electronics", "computers"] } },
//     { inStock: true }
//   ]
// }
```

## Supported Operators by Type

| Type        | Supported Operators                               |
| ----------- | ------------------------------------------------- |
| **string**  | `eq`, `ne`, `in`, `nin`, `regex`, `search`        |
| **number**  | `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin` |
| **boolean** | `eq`, `ne`                                        |
| **date**    | `eq`, `ne`, `gt`, `gte`, `lt`, `lte`              |

## Type Parsing

Values are automatically parsed based on the field type:

- **Numbers**: String values like `"25"` are converted to `25`
- **Booleans**: String values like `"true"` are converted to `true`
- **Dates**: String values are converted to `Date` objects
- **Arrays**: Supports both arrays `["a", "b"]` and comma-separated strings `"a,b"`

## Use Cases

- **AI-powered search interfaces**: Let AI models suggest searchable fields and operators
- **Dynamic query builders**: Build MongoDB queries from user input
- **API query parsers**: Convert query parameters to MongoDB queries
- **Search suggestion systems**: Show users what they can search for

## License

MIT
