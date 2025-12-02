import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const name = "TypescriptUtils";

const baseConfig = {
  input: "src/index.ts",
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.bundle.json",
    }),
  ],
};

export default [
  // UMD Bundle (works everywhere)
  {
    ...baseConfig,
    output: {
      file: "bundles/typescript-utils.umd.js",
      format: "umd",
      name,
      sourcemap: true,
    },
  },

  // UMD Minified Bundle
  {
    ...baseConfig,
    plugins: [...baseConfig.plugins, terser()],
    output: {
      file: "bundles/typescript-utils.umd.min.js",
      format: "umd",
      name,
      sourcemap: true,
    },
  },

  // IIFE Bundle (for direct <script> tag)
  {
    ...baseConfig,
    output: {
      file: "bundles/typescript-utils.iife.js",
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
      file: "bundles/typescript-utils.iife.min.js",
      format: "iife",
      name,
      sourcemap: true,
    },
  },

  // ES Module Bundle (for modern browsers)
  {
    ...baseConfig,
    output: {
      file: "bundles/typescript-utils.esm.js",
      format: "es",
      sourcemap: true,
    },
  },

  // ES Module Minified Bundle
  {
    ...baseConfig,
    plugins: [...baseConfig.plugins, terser()],
    output: {
      file: "bundles/typescript-utils.esm.min.js",
      format: "es",
      sourcemap: true,
    },
  },
];
