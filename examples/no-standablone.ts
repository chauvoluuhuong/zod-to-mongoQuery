import { capitalize } from "../src/string-utils";
import { unique } from "../src/array-utils";
import { clamp } from "../src/number-utils";

// Set breakpoints on these lines to debug step by step
const input = "hello world";
const result = capitalize(input);
console.log(`capitalize("${input}") = "${result}"`);

const numbers = [1, 2, 2, 3, 3, 4];
const uniqueNumbers = unique(numbers);
console.log(`unique([${numbers.join(", ")}]) = [${uniqueNumbers.join(", ")}]`);

const value = 10;
const min = 0;
const max = 5;
const clampedValue = clamp(value, min, max);
console.log(`clamp(${value}, ${min}, ${max}) = ${clampedValue}`);
