import tseslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".wrangler/",
      ".vscode/",
      "out/",
      "vitest.setup.ts",
      "vite.config.ts",
      "vitest.config.ts",
      "playwright.config.ts",
      "e2e/",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "public/mockServiceWorker.js",
      "eslint.config.js",
      "scripts/",
    ],
  },
  ...tseslint.configs["flat/recommended-type-checked"],
  ...tseslint.configs["flat/stylistic-type-checked"],
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.app.json",
      },
    },
  },
  {
    files: ["worker/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.worker.json",
      },
    },
  },
  prettier,
];
