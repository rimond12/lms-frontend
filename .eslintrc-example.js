// Alternative ESLint configuration example
// You can replace the current eslint.config.mjs with this approach

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const isDevelopment = process.env.NODE_ENV === "development";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Stricter rules for production, more lenient for development
      "@typescript-eslint/no-explicit-any": isDevelopment ? "warn" : "error",
      "@typescript-eslint/no-unused-vars": isDevelopment ? "warn" : "error",
      "react-hooks/exhaustive-deps": isDevelopment ? "warn" : "error",
      
      // Always warnings
      "no-console": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn",
    },
    // Ignore specific files or directories
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      // Add specific files you want to ignore
      // "src/legacy/**",
    ],
  },
];

export default eslintConfig;
