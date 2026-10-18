import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Same env as the production build under test (Clerk development keys live here).
loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });

const PORT = Number(process.env.E2E_PORT ?? 3022);

/**
 * E2E runs against a PRODUCTION build served on :3022, backed by the
 * throw-away test database and test buckets (scripts/e2e-server.ts).
 * - `desktop` runs everything; `mobile` runs the public, read-only specs.
 * - Flows in tests/e2e/flows mutate shared state and run serially.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-ES",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: /flows\// },
  ],
  webServer: {
    command: "pnpm tsx scripts/e2e-server.ts",
    url: `http://localhost:${PORT}`,
    timeout: 600_000,
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
