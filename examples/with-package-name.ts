// This example shows how end users would import from the published package
// Note: This requires the package to be published and installed via npm

import { capitalize } from "typescript-utils-package";

console.log(capitalize("hello world"));

// Additional examples with more functions
import { unique, deepClone, clamp } from "typescript-utils-package";

console.log("unique([1, 2, 2, 3]):", unique([1, 2, 2, 3]));
console.log("clamp(10, 0, 5):", clamp(10, 0, 5));

const original = { a: { b: 1 } };
const cloned = deepClone(original);
console.log("deepClone works:", original !== cloned);
