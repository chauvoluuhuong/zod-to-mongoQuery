// Node.js example using UMD bundle (no npm install required!)
const TypescriptUtils = require("../bundles/typescript-utils.umd.js");

console.log("🚀 Using TypeScript Utils without npm install!\n");

// Extract functions from the UMD bundle
const { capitalize, unique, deepClone, clamp, isArray, toCamelCase } =
  TypescriptUtils;

console.log("📝 String Utils:");
console.log('capitalize("hello world"):', capitalize("hello world"));
console.log('toCamelCase("hello-world"):', toCamelCase("hello-world"));

console.log("\n🔧 Array Utils:");
console.log("unique([1, 2, 2, 3, 3]):", unique([1, 2, 2, 3, 3]));

console.log("\n📦 Object Utils:");
const original = { a: { b: 1 }, c: [1, 2, 3] };
const cloned = deepClone(original);
console.log("original:", original);
console.log("deepClone(original):", cloned);
console.log("Are they different objects?", original !== cloned);

console.log("\n🔢 Number Utils:");
console.log("clamp(10, 0, 5):", clamp(10, 0, 5));

console.log("\n✅ Type Utils:");
console.log("isArray([1, 2, 3]):", isArray([1, 2, 3]));
console.log('isArray("hello"):', isArray("hello"));

console.log("\n🎉 Success! All functions working without npm install!");
