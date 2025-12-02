# 📦 Standalone Bundle Usage Guide

Your TypeScript utils package can now be used **without npm install** in multiple ways! Here are all the standalone bundle options:

## 🎯 Available Bundles

| Bundle                         | Size      | Format    | Use Case                    |
| ------------------------------ | --------- | --------- | --------------------------- |
| `typescript-utils.umd.js`      | 10KB      | UMD       | Node.js/Browser (Universal) |
| `typescript-utils.umd.min.js`  | **3.4KB** | UMD       | Production Universal        |
| `typescript-utils.iife.js`     | 10KB      | IIFE      | Browser `<script>` tag      |
| `typescript-utils.iife.min.js` | **3.2KB** | IIFE      | Production Browser          |
| `typescript-utils.esm.js`      | 7.9KB     | ES Module | Modern Browser/Bundlers     |
| `typescript-utils.esm.min.js`  | **3.3KB** | ES Module | Production Modern           |

## 🚀 Usage Examples

### 1. **Node.js (No npm install required!)**

```javascript
// Using UMD bundle in Node.js
const TypescriptUtils = require("./bundles/typescript-utils.umd.min.js");
const { capitalize, unique, deepClone } = TypescriptUtils;

console.log(capitalize("hello world")); // 'Hello world'
console.log(unique([1, 2, 2, 3])); // [1, 2, 3]
```

### 2. **Browser - Script Tag (IIFE)**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <!-- Include the bundle -->
    <script src="./bundles/typescript-utils.iife.min.js"></script>

    <script>
      // Functions available under TypescriptUtils global
      const { capitalize, unique, deepClone } = TypescriptUtils;

      console.log(capitalize("hello world")); // 'Hello world'
      console.log(unique([1, 2, 2, 3])); // [1, 2, 3]
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
      // Import specific functions
      import {
        capitalize,
        unique,
        deepClone,
      } from "./bundles/typescript-utils.esm.min.js";

      console.log(capitalize("hello world")); // 'Hello world'
      console.log(unique([1, 2, 2, 3])); // [1, 2, 3]
    </script>
  </body>
</html>
```

### 4. **CDN Distribution**

Upload the minified bundles to a CDN and use them directly:

```html
<!-- Using jsDelivr (example) -->
<script src="https://cdn.jsdelivr.net/npm/your-package@1.0.0/bundles/typescript-utils.iife.min.js"></script>

<!-- Or ES Modules -->
<script type="module">
  import { capitalize } from "https://cdn.jsdelivr.net/npm/your-package@1.0.0/bundles/typescript-utils.esm.min.js";
  console.log(capitalize("hello"));
</script>
```

### 5. **Webpack/Rollup/Vite Projects**

```javascript
// Copy the ESM bundle to your project and import
import { capitalize, unique } from "./vendor/typescript-utils.esm.min.js";

// Or use the UMD bundle
const utils = require("./vendor/typescript-utils.umd.min.js");
```

## 🎯 Distribution Strategies

### **1. Download & Include**

Users can download the bundle files and include them directly:

```bash
# Download the bundle you need
curl -O https://yoursite.com/bundles/typescript-utils.iife.min.js
```

### **2. Copy to Project**

Copy the relevant bundle file to your project:

```
your-project/
├── vendor/
│   └── typescript-utils.iife.min.js
└── index.html
```

### **3. Self-Hosted CDN**

Host the bundles on your server:

```
https://yoursite.com/libs/typescript-utils.iife.min.js
```

### **4. Package with Application**

Include bundles in your application build:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      "typescript-utils": path.resolve(
        __dirname,
        "vendor/typescript-utils.esm.min.js"
      ),
    },
  },
};
```

## 📊 Bundle Comparison

| Feature             | UMD         | IIFE       | ES Module      |
| ------------------- | ----------- | ---------- | -------------- |
| **Browser Support** | ✅ All      | ✅ All     | ✅ Modern only |
| **Node.js Support** | ✅ Yes      | ❌ No      | ⚠️ With flags  |
| **Global Variable** | ✅ Yes      | ✅ Yes     | ❌ No          |
| **Tree Shaking**    | ❌ No       | ❌ No      | ✅ Yes         |
| **Import Syntax**   | `require()` | `<script>` | `import`       |
| **Size**            | 3.4KB       | 3.2KB      | 3.3KB          |

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

### **✅ No Dependencies**

- Works without `npm install`
- No `node_modules` folder needed
- Perfect for CDN distribution

### **✅ Universal Compatibility**

- UMD works in Node.js and browsers
- IIFE works in any browser
- ES Modules work in modern environments

### **✅ Small & Optimized**

- Minified bundles are only ~3KB
- Tree-shaken and optimized
- Source maps included for debugging

### **✅ Easy Distribution**

- Upload to CDN
- Include in projects
- Email as attachments
- Works offline

## 🎉 Perfect For

- **Libraries & Frameworks**: Distribute without npm
- **CDN Hosting**: Serve from any CDN
- **Legacy Projects**: Drop into existing codebases
- **Demos & Examples**: No build step required
- **Offline Development**: Works without internet
- **Enterprise**: Distribute internally without npm registry

---

Now your TypeScript utils can be used **anywhere, anytime, without npm install**! 🚀
