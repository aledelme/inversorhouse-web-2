import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Architecture rules (ADR-0004). Messages are written for humans AND agents:
 * they say what to do instead.
 */
const featureImports = {
  group: ["@/features/*/*", "!@/features/*/server"],
  message:
    "Import a feature through its public entry points only: '@/features/<name>' (client-safe) or '@/features/<name>/server' (server-only). Inside the same feature use relative imports.",
};

const noAppImports = {
  group: ["@/app/*", "@/app/**"],
  message: "Nothing imports from src/app. Move shared code to a feature, lib or components.",
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "src/db/migrations/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "no-restricted-imports": ["error", { patterns: [featureImports, noAppImports] }],
    },
  },
  {
    // Read env vars through `@/lib/env` so they are validated and typed.
    files: ["src/**/*.{ts,tsx}"],
    // Scripts/seeds run in plain Node (outside Next) and read their own env.
    ignores: ["src/lib/env.ts", "src/db/create.ts", "src/db/seed/**", "src/i18n/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Use `env` from '@/lib/env' instead of process.env (exception: process.env.NODE_ENV in src/db/client.ts).",
        },
      ],
    },
  },
  {
    files: ["src/db/client.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // Lower layers never depend on features or routes.
    files: ["src/lib/**", "src/db/**", "src/components/**", "src/config/**", "src/i18n/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            noAppImports,
            {
              group: ["@/features", "@/features/**"],
              message:
                "lib/db/components/config are lower layers and must not import features (ADR-0004).",
            },
          ],
        },
      ],
    },
  },
]);
