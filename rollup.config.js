import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const name = "ZodToMongoQuery";
const packageName = "zod-to-mongo-query";

const baseConfig = {
  input: "src/index.ts",
  plugins: [
    resolve({
      // Bundle all dependencies (including zod) for CDN use
      preferBuiltins: false,
      browser: true,
      exportConditions: ["default", "module", "import"],
    }),
    commonjs({
      // Convert CommonJS modules to ES6
      transformMixedEsModules: true,
    }),
    typescript({
      tsconfig: "./tsconfig.bundle.json",
    }),
  ],
  // Bundle all dependencies instead of externalizing them
  external: [],
};

export default [
  // UMD Bundle (works everywhere)
  {
    ...baseConfig,
    output: {
      file: `bundles/${packageName}.umd.js`,
      format: "umd",
      name,
      sourcemap: true,
      globals: {},
    },
  },

  // UMD Minified Bundle
  {
    ...baseConfig,
    plugins: [...baseConfig.plugins, terser()],
    output: {
      file: `bundles/${packageName}.umd.min.js`,
      format: "umd",
      name,
      sourcemap: true,
      globals: {},
    },
  },

  // IIFE Bundle (for direct <script> tag)
  {
    ...baseConfig,
    output: {
      file: `bundles/${packageName}.iife.js`,
      format: "iife",
      name,
      sourcemap: true,
    },
  },

  // IIFE Minified Bundle
  {
    ...baseConfig,
    plugins: [...baseConfig.plugins, terser()],
    output: {
      file: `bundles/${packageName}.iife.min.js`,
      format: "iife",
      name,
      sourcemap: true,
    },
  },

  // ES Module Bundle (for modern browsers)
  {
    ...baseConfig,
    output: {
      file: `bundles/${packageName}.esm.js`,
      format: "es",
      sourcemap: true,
    },
  },

  // ES Module Minified Bundle
  {
    ...baseConfig,
    plugins: [...baseConfig.plugins, terser()],
    output: {
      file: `bundles/${packageName}.esm.min.js`,
      format: "es",
      sourcemap: true,
    },
  },
];
