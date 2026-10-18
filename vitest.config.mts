import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const stubs = { "server-only": fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url)) };

// Integration tests talk to the throw-away Docker services (see docker/compose.yml).
const integrationEnv = {
  DATABASE_URL: `postgres://inversorhouse:inversorhouse@localhost:${process.env.IH_PG_TEST_PORT ?? 5443}/inversorhouse_test`,
  NEXT_PUBLIC_SITE_URL: "http://localhost:3022",
  NEXT_PUBLIC_R2_CLOUDFLARE_URL: `http://localhost:${process.env.IH_S3_PORT ?? 9010}/inversorhouse-test-public`,
  R2_ENDPOINT: `http://localhost:${process.env.IH_S3_PORT ?? 9010}`,
  R2_ACCESS_KEY_ID: "inversorhouse",
  R2_SECRET_ACCESS_KEY: "inversorhouse-secret",
  R2_PUBLIC_BUCKET: "inversorhouse-test-public",
  R2_PRIVATE_BUCKET: "inversorhouse-test-private",
  ADMIN_EMAILS: "admin@example.com",
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias: stubs, tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["**/*.int.test.ts", "**/node_modules/**"],
          environment: "jsdom",
          setupFiles: ["./tests/setup-unit.ts"],
          env: { SKIP_ENV_VALIDATION: "1" },
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.test.ts", "tests/integration/**/*.int.test.ts"],
          environment: "node",
          globalSetup: ["./tests/integration/global-setup.ts"],
          setupFiles: ["./tests/integration/setup.ts"],
          env: integrationEnv,
          // One shared database: run files sequentially.
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
