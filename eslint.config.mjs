import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "@typescript-eslint/no-unused-vars": "warn",
      
      // React specific rules
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      
      // General JavaScript rules
      "no-console": "warn", // Allow console in development
      "prefer-const": "warn",
      
      // Next.js specific
      "@next/next/no-img-element": "warn",
      
      // You can disable specific rules entirely if needed:
      // "@typescript-eslint/no-explicit-any": "off",
      // "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
