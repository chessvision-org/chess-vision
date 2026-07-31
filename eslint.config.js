import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "build/",
      "dist/",
      "node_modules/",
      "public/",
      ".tmp/",
      "supabase/",
      "src/",
      "modules/",
      "server/",
      "scripts/",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,cjs,mjs,ts}"],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "no-useless-escape": "error",
      "no-console": "off",
      "no-debugger": "warn",
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },
);
