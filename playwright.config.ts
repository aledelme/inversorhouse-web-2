import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3022);

/**
 * E2E runs against a PRODUCTION build served on :3022, backed by the
 * throw-away test database and test buckets (scripts/e2e-server.ts).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-ES",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm tsx scripts/e2e-server.ts",
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
