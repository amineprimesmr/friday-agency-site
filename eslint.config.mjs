import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      "node_modules/**",
      ".claude/**",
      ".next/**",
      "out/**",
      "public/**/*.js",
      "public/legacy-agency/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
