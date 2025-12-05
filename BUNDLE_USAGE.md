# 📦 Standalone Bundle Usage Guide

`zod-to-mongo-query` can now be used **without npm install** in multiple ways! Here are all the standalone bundle options:

## 🎯 Available Bundles

| Bundle | Format | Use Case |
|--------|--------|----------|
| `zod-to-mongo-query.umd.js` | UMD | Node.js/Browser (Universal) |
| `zod-to-mongo-query.umd.min.js` | UMD (minified) | Production Universal |
| `zod-to-mongo-query.iife.js` | IIFE | Browser `<script>` tag |
| `zod-to-mongo-query.iife.min.js` | IIFE (minified) | Production Browser |
| `zod-to-mongo-query.esm.js` | ES Module | Modern Browser/Bundlers |
| `zod-to-mongo-query.esm.min.js` | ES Module (minified) | Production Modern |

**Note**: All bundles include the `zod` dependency internally, so the library functions work without external zod. However, you'll still need `zod` from CDN if you want to create schemas.

## 🚀 Usage Examples

### 1. **Node.js (No npm install required!)**

```javascript
// Using UMD bundle in Node.js
const ZodToMongoQuery = require("./bundles/zod-to-mongo-query.umd.min.js");
const { getQueryAbilities, convertToMongoQuery } = ZodToMongoQuery;

// Note: You'll need zod separately for schema creation
const { z } = require("zod");

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const abilities = getQueryAbilities(schema);
const query = convertToMongoQuery("age", "gte", 18, "number");
console.log(query); // { age: { $gte: 18 } }
```

### 2. **Browser - Script Tag (IIFE)**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <!-- Include zod (needed for schema creation) -->
    <script src="https://cdn.jsdelivr.net/npm/zod@4.1.13/index.min.js"></script>
    
    <!-- Include the bundle -->
    <script src="./bundles/zod-to-mongo-query.iife.min.js"></script>

    <script>
      // Functions available under ZodToMongoQuery global
      const { getQueryAbilities, convertToMongoQuery } = ZodToMongoQuery;

      // Create a schema
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string(),
      });

      // Get query abilities
      const abilities = getQueryAbilities(schema);
      console.log(abilities);

      // Build MongoDB queries
      const query1 = convertToMongoQuery("age", "gte", 18, "number");
      console.log(query1); // { age: { $gte: 18 } }

      const query2 = convertToMongoQuery("name", "search", "john", "string");
      console.log(query2); // { name: { $regex: "john", $options: "i" } }
    </script>
  </body>
</html>
```

### 3. **Modern Browser - ES Modules**

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      // Import zod (needed for schema creation)
      import { z } from "https://cdn.jsdelivr.net/npm/zod@4.1.13/index.min.js";
      
      // Import specific functions
      import {
        getQueryAbilities,
        convertToMongoQuery,
      } from "./bundles/zod-to-mongo-query.esm.min.js";

      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const abilities = getQueryAbilities(schema);
      const query = convertToMongoQuery("age", "gte", 18, "number");
      console.log(query);
    </script>
  </body>
</html>
```

### 4. **CDN Distribution**

Use bundles directly from CDN:

```html
<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/zod@4.1.13/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.iife.min.js"></script>

<script>
  const { getQueryAbilities, convertToMongoQuery } = ZodToMongoQuery;
  // Use the library...
</script>

<!-- Or ES Modules -->
<script type="module">
  import { z } from "https://cdn.jsdelivr.net/npm/zod@4.1.13/index.min.js";
  import { getQueryAbilities, convertToMongoQuery } from "https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.esm.min.js";
  
  // Use the library...
</script>
```

### 5. **Webpack/Rollup/Vite Projects**

```javascript
// Copy the ESM bundle to your project and import
import { getQueryAbilities, convertToMongoQuery } from "./vendor/zod-to-mongo-query.esm.min.js";

// Or use the UMD bundle
const ZodToMongoQuery = require("./vendor/zod-to-mongo-query.umd.min.js");
const { getQueryAbilities, convertToMongoQuery } = ZodToMongoQuery;
```

## 🎯 Distribution Strategies

### **1. Download & Include**

Users can download the bundle files and include them directly:

```bash
# Download the bundle you need
curl -O https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.iife.min.js
```

### **2. Copy to Project**

Copy the relevant bundle file to your project:

```
your-project/
├── vendor/
│   └── zod-to-mongo-query.iife.min.js
└── index.html
```

### **3. Self-Hosted CDN**

Host the bundles on your server:

```
https://yoursite.com/libs/zod-to-mongo-query.iife.min.js
```

### **4. Package with Application**

Include bundles in your application build:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      "zod-to-mongo-query": path.resolve(
        __dirname,
        "vendor/zod-to-mongo-query.esm.min.js"
      ),
    },
  },
};
```

## 📊 Bundle Comparison

| Feature | UMD | IIFE | ES Module |
|---------|-----|------|-----------|
| **Browser Support** | ✅ All | ✅ All | ✅ Modern only |
| **Node.js Support** | ✅ Yes | ❌ No | ⚠️ With flags |
| **Global Variable** | ✅ Yes (`ZodToMongoQuery`) | ✅ Yes (`ZodToMongoQuery`) | ❌ No |
| **Tree Shaking** | ❌ No | ❌ No | ✅ Yes |
| **Import Syntax** | `require()` | `<script>` | `import` |
| **Includes Zod** | ✅ Yes (internal) | ✅ Yes (internal) | ✅ Yes (internal) |

## 🔧 Build Your Own

To generate fresh bundles:

```bash
# Install dependencies (one time)
npm install

# Generate all bundles
npm run bundle

# Watch for changes
npm run bundle:watch

# Clean bundles
npm run clean:bundles
```

## 🌟 Advantages of Standalone Bundles

### **✅ No npm Required**

- Works without `npm install`
- No `node_modules` folder needed
- Perfect for CDN distribution

### **✅ Universal Compatibility**

- UMD works in Node.js and browsers
- IIFE works in any browser
- ES Modules work in modern environments

### **✅ Optimized**

- Minified and optimized
- Source maps included for debugging
- Zod dependency bundled internally

### **✅ Easy Distribution**

- Upload to CDN
- Include in projects
- Works offline
- Perfect for demos and examples

## 🎉 Perfect For

- **CDN Hosting**: Serve from any CDN (jsDelivr, unpkg, etc.)
- **Legacy Projects**: Drop into existing codebases
- **Demos & Examples**: No build step required
- **Offline Development**: Works without internet
- **Enterprise**: Distribute internally without npm registry
- **Browser Extensions**: Include directly in extensions

## 📚 API Reference

### `getQueryAbilities(schema, maxDepth?)`

Extracts query capabilities from a Zod schema.

**Parameters:**
- `schema`: A `ZodObject` schema
- `maxDepth` (optional): Maximum depth to traverse nested objects (default: `Infinity`)

**Returns:** An object mapping field paths to their types and supported operators.

### `convertToMongoQuery(field, operator, value, type)`

Converts a field, operator, and value into a MongoDB query object.

**Parameters:**
- `field`: The field path (supports dot notation for nested fields)
- `operator`: The operator (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `regex`, `search`)
- `value`: The value to query for
- `type`: The field type (from `getQueryAbilities`)

**Returns:** A MongoDB query object.

---

Now `zod-to-mongo-query` can be used **anywhere, anytime, without npm install**! 🚀

For detailed CDN deployment instructions, see [CDN_DEPLOYMENT.md](./CDN_DEPLOYMENT.md).
