# 🚀 Deploy to jsDelivr CDN (Option 1)

This guide walks you through deploying your bundles to jsDelivr CDN, which automatically serves packages from npm.

## 📋 Prerequisites

1. ✅ npm account (create one at [npmjs.com](https://www.npmjs.com/signup) if needed)
2. ✅ Bundles built (`npm run bundle`)
3. ✅ Package ready to publish

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Package

Make sure everything is built and ready:

```bash
# Build TypeScript files
npm run build

# Generate bundles
npm run bundle

# Verify bundles exist
ls -la bundles/
```

You should see:

- `zod-to-mongo-query.umd.js` and `.umd.min.js`
- `zod-to-mongo-query.iife.js` and `.iife.min.js`
- `zod-to-mongo-query.esm.js` and `.esm.min.js`
- Plus their `.map` source map files

### Step 2: Verify package.json

Ensure your `package.json` includes the `bundles` folder in the `files` array:

```json
{
  "files": ["dist", "bundles", "README.md"]
}
```

✅ This is already configured in your package.json!

### Step 3: Login to npm

```bash
# Login to npm (if not already logged in)
npm login

# Verify you're logged in
npm whoami
```

### Step 4: Check if Package Already Exists

```bash
# Check if the package name is available or already published
npm view zod-to-mongo-query
```

If you get a 404, the package doesn't exist yet. If you get package info, it already exists.

### Step 5: Publish to npm

**If this is your first publish:**

```bash
# Publish the package
npm publish
```

**If updating an existing package:**

```bash
# Update version in package.json first (e.g., 1.0.1 -> 1.0.2)
# Then publish
npm publish
```

**For scoped packages (if you have one):**

```bash
# Make package public (scoped packages are private by default)
npm publish --access public
```

### Step 6: Verify on npm

After publishing, verify your package is available:

1. Visit: `https://www.npmjs.com/package/zod-to-mongo-query`
2. Check that the `bundles` folder is included in the package files

### Step 7: Access via jsDelivr CDN

Once published, your bundles are **automatically available** via jsDelivr! 🎉

#### CDN URLs Format:

```
https://cdn.jsdelivr.net/npm/{package-name}@{version}/bundles/{bundle-file}
```

#### Your CDN URLs:

**IIFE Bundle (for script tags):**

```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.2/bundles/zod-to-mongo-query.iife.min.js
```

**ES Module Bundle:**

```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.2/bundles/zod-to-mongo-query.esm.min.js
```

**UMD Bundle:**

```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.2/bundles/zod-to-mongo-query.umd.min.js
```

### Step 8: Test CDN Links

Test that your CDN links work:

```bash
# Test IIFE bundle
curl -I https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.2/bundles/zod-to-mongo-query.iife.min.js

# Should return HTTP 200
```

Or open in browser:

```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.iife.min.js
```

## 📝 Usage Example

Once published, users can use your library directly from CDN:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Using zod-to-mongo-query from CDN</title>
  </head>
  <body>
    <!-- Load zod (needed for schema creation) -->
    <script src="https://cdn.jsdelivr.net/npm/zod@4.1.13/index.min.js"></script>

    <!-- Load your library -->
    <script src="https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.iife.min.js"></script>

    <script>
      const { getQueryAbilities, convertToMongoQuery } = ZodToMongoQuery;

      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const abilities = getQueryAbilities(schema);
      console.log(abilities);

      const query = convertToMongoQuery("age", "gte", 18, "number");
      console.log(query); // { age: { $gte: 18 } }
    </script>
  </body>
</html>
```

## 🔄 Updating Your Package

When you make changes and want to update the CDN:

1. **Update version** in `package.json`:

   ```json
   {
     "version": "1.0.2" // Increment version
   }
   ```

2. **Rebuild bundles**:

   ```bash
   npm run build:all
   ```

3. **Publish new version**:

   ```bash
   npm publish
   ```

4. **Update CDN URLs** to use the new version:
   ```
   https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.2/bundles/...
   ```

## 🎯 Version Pinning

**Recommended:** Pin to specific versions in production:

```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/...
```

**For latest (not recommended for production):**

```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query/bundles/...
```

## ✅ Verification Checklist

Before publishing, make sure:

- [ ] Bundles are built (`npm run bundle`)
- [ ] All bundle files exist in `bundles/` folder
- [ ] `bundles` folder is in `package.json` `files` array
- [ ] Version number is correct
- [ ] README.md is up to date
- [ ] Tests pass (`npm test`)
- [ ] You're logged into npm (`npm whoami`)

## 🐛 Troubleshooting

### Package already exists

If you get an error that the package already exists:

- Update the version number in `package.json`
- Or use `npm publish --force` (not recommended)

### Bundles not showing on npm

- Verify `bundles` is in the `files` array in `package.json`
- Check `.npmignore` doesn't exclude `bundles/`
- Try `npm pack` to see what will be published

### CDN link returns 404

- Wait a few minutes after publishing (jsDelivr caches)
- Verify the exact path matches your package structure
- Check version number is correct

### CDN link returns old version

- jsDelivr caches aggressively
- Use a specific version number
- Clear browser cache

## 📚 Additional Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [jsDelivr Documentation](https://www.jsdelivr.com/documentation)
- [npm Package Files](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#files)

---

**That's it!** Once published to npm, your bundles are automatically available on jsDelivr CDN. 🎉
