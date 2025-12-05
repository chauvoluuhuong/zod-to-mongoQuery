# ⚡ Quick Deploy to jsDelivr CDN

## TL;DR - 3 Steps to Deploy

### 1. Build Everything
```bash
npm run build:all
```

### 2. Login to npm (if not already)
```bash
npm login
```

### 3. Publish
```bash
npm publish
```

**That's it!** Your bundles will be automatically available on jsDelivr CDN.

## 🎯 Your CDN URLs (after publishing)

Replace `@1.0.1` with your actual version:

**IIFE (Browser script tag):**
```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.iife.min.js
```

**ES Module:**
```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.esm.min.js
```

**UMD:**
```
https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.umd.min.js
```

## 📝 Quick Test

After publishing, test your CDN link:

```bash
curl -I https://cdn.jsdelivr.net/npm/zod-to-mongo-query@1.0.1/bundles/zod-to-mongo-query.iife.min.js
```

Should return `HTTP/2 200`.

## 🔄 Update Process

When you need to update:

1. Update version in `package.json`
2. Run `npm run build:all`
3. Run `npm publish`
4. Update CDN URLs to new version

---

For detailed instructions, see [DEPLOY_TO_CDN.md](./DEPLOY_TO_CDN.md)

