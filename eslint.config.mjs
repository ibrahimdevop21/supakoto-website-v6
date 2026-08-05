import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * RTL guard: physical margin/padding utilities break the Arabic-default
 * layout. Logical properties only (ms-/me-/ps-/pe-).
 */
const physicalSpacing = "(^|[\\s:])-?(ml|mr|pl|pr)-";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXAttribute[name.name="className"] Literal[value=/${physicalSpacing}/]`,
          message:
            "Physical spacing utility (ml-/mr-/pl-/pr-). Use logical ms-/me-/ps-/pe- instead.",
        },
        {
          selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/${physicalSpacing}/]`,
          message:
            "Physical spacing utility (ml-/mr-/pl-/pr-). Use logical ms-/me-/ps-/pe- instead.",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "reference/**",
      "scripts/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
