var TypescriptUtils = (function (exports) {
    'use strict';

    /**
     * Capitalizes the first letter of a string
     */
    function capitalize(str) {
        if (!str)
            return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    /**
     * Converts a string to camelCase
     */
    function toCamelCase(str) {
        return str
            .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
            .replace(/^[A-Z]/, (char) => char.toLowerCase());
    }
    /**
     * Converts a string to kebab-case
     */
    function toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }
    /**
     * Converts a string to snake_case
     */
    function toSnakeCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .replace(/[\s-]+/g, "_")
            .toLowerCase();
    }
    /**
     * Truncates a string to a specified length with optional suffix
     */
    function truncate(str, length, suffix = "...") {
        if (str.length <= length)
            return str;
        return str.slice(0, length - suffix.length) + suffix;
    }
    /**
     * Removes leading and trailing whitespace and reduces multiple spaces to single space
     */
    function normalizeWhitespace(str) {
        return str.trim().replace(/\s+/g, " ");
    }

    /**
     * Removes duplicate values from an array
     */
    function unique(array) {
        return [...new Set(array)];
    }
    /**
     * Chunks an array into smaller arrays of specified size
     */
    function chunk(array, size) {
        if (size <= 0)
            throw new Error("Chunk size must be greater than 0");
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    /**
     * Flattens a nested array by one level
     */
    function flatten(array) {
        return array.reduce((flat, item) => flat.concat(item), []);
    }
    /**
     * Groups array elements by a key function
     */
    function groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }
    /**
     * Returns the intersection of two arrays
     */
    function intersection(array1, array2) {
        const set2 = new Set(array2);
        return array1.filter((item) => set2.has(item));
    }
    /**
     * Returns the difference between two arrays (items in first array but not in second)
     */
    function difference(array1, array2) {
        const set2 = new Set(array2);
        return array1.filter((item) => !set2.has(item));
    }
    /**
     * Shuffles an array using Fisher-Yates algorithm
     */
    function shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Deep clones an object
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== "object")
            return obj;
        if (obj instanceof Date)
            return new Date(obj.getTime());
        if (obj instanceof Array)
            return obj.map((item) => deepClone(item));
        if (typeof obj === "object") {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }
    /**
     * Deep merges two or more objects
     */
    function deepMerge(...objects) {
        const result = {};
        for (const obj of objects) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (value && typeof value === "object" && !Array.isArray(value)) {
                        result[key] = deepMerge(result[key] || {}, value);
                    }
                    else {
                        result[key] = value;
                    }
                }
            }
        }
        return result;
    }
    /**
     * Gets a nested property value using dot notation
     */
    function getNestedValue(obj, path) {
        return path.split(".").reduce((current, key) => current === null || current === void 0 ? void 0 : current[key], obj);
    }
    /**
     * Sets a nested property value using dot notation
     */
    function setNestedValue(obj, path, value) {
        const keys = path.split(".");
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current) || typeof current[key] !== "object") {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    /**
     * Picks specified properties from an object
     */
    function pick(obj, keys) {
        const result = {};
        keys.forEach((key) => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    }
    /**
     * Omits specified properties from an object
     */
    function omit(obj, keys) {
        const result = { ...obj };
        keys.forEach((key) => {
            delete result[key];
        });
        return result;
    }

    /**
     * Clamps a number between min and max values
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    /**
     * Rounds a number to specified decimal places
     */
    function round(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
    /**
     * Generates a random number between min and max (inclusive)
     */
    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    /**
     * Generates a random integer between min and max (inclusive)
     */
    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Converts degrees to radians
     */
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Converts radians to degrees
     */
    function toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    /**
     * Checks if a number is even
     */
    function isEven(num) {
        return num % 2 === 0;
    }
    /**
     * Checks if a number is odd
     */
    function isOdd(num) {
        return num % 2 !== 0;
    }
    /**
     * Formats a number with thousand separators
     */
    function formatNumber(num, locale = "en-US") {
        return num.toLocaleString(locale);
    }

    /**
     * Checks if a value is null or undefined
     */
    function isNil(value) {
        return value === null || value === undefined;
    }
    /**
     * Checks if a value is not null and not undefined
     */
    function isNotNil(value) {
        return value !== null && value !== undefined;
    }
    /**
     * Checks if a value is a string
     */
    function isString(value) {
        return typeof value === "string";
    }
    /**
     * Checks if a value is a number
     */
    function isNumber(value) {
        return typeof value === "number" && !isNaN(value);
    }
    /**
     * Checks if a value is a boolean
     */
    function isBoolean(value) {
        return typeof value === "boolean";
    }
    /**
     * Checks if a value is an array
     */
    function isArray(value) {
        return Array.isArray(value);
    }
    /**
     * Checks if a value is a plain object
     */
    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }
    /**
     * Checks if a value is a function
     */
    function isFunction(value) {
        return typeof value === "function";
    }
    /**
     * Checks if a value is a Date object
     */
    function isDate(value) {
        return value instanceof Date && !isNaN(value.getTime());
    }
    /**
     * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
     */
    function isEmpty(value) {
        if (isNil(value))
            return true;
        if (isString(value) || isArray(value))
            return value.length === 0;
        if (isObject(value))
            return Object.keys(value).length === 0;
        return false;
    }

    exports.capitalize = capitalize;
    exports.chunk = chunk;
    exports.clamp = clamp;
    exports.deepClone = deepClone;
    exports.deepMerge = deepMerge;
    exports.difference = difference;
    exports.flatten = flatten;
    exports.formatNumber = formatNumber;
    exports.getNestedValue = getNestedValue;
    exports.groupBy = groupBy;
    exports.intersection = intersection;
    exports.isArray = isArray;
    exports.isBoolean = isBoolean;
    exports.isDate = isDate;
    exports.isEmpty = isEmpty;
    exports.isEven = isEven;
    exports.isFunction = isFunction;
    exports.isNil = isNil;
    exports.isNotNil = isNotNil;
    exports.isNumber = isNumber;
    exports.isObject = isObject;
    exports.isOdd = isOdd;
    exports.isString = isString;
    exports.normalizeWhitespace = normalizeWhitespace;
    exports.omit = omit;
    exports.pick = pick;
    exports.randomBetween = randomBetween;
    exports.randomIntBetween = randomIntBetween;
    exports.round = round;
    exports.setNestedValue = setNestedValue;
    exports.shuffle = shuffle;
    exports.toCamelCase = toCamelCase;
    exports.toDegrees = toDegrees;
    exports.toKebabCase = toKebabCase;
    exports.toRadians = toRadians;
    exports.toSnakeCase = toSnakeCase;
    exports.truncate = truncate;
    exports.unique = unique;

    return exports;

})({});
//# sourceMappingURL=typescript-utils.iife.js.map
