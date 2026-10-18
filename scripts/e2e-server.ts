/**
 * Web server for Playwright: resets the TEST database, builds and starts the app on :3022.
 * Env comes from .env.production(.local) with DB/storage forced to the test services.
 */
import { sql } from "drizzle-orm";

import { createDb } from "../src/db/create";
import { runMigrations } from "../src/db/migrate";
import { seedGeo } from "../src/db/seed/geo";
import { seedSampleData } from "../src/db/seed/sample";

import { assertLocalServices, loadEnv } from "./lib/env";
import { run, servicesUp } from "./lib/run";

const PORT = process.env.E2E_PORT ?? "3022";
const S3_PORT = process.env.IH_S3_PORT ?? "9010";

async function main() {
  loadEnv("production");
  Object.assign(process.env, {
    DATABASE_URL: `postgres://inversorhouse:inversorhouse@localhost:${process.env.IH_PG_TEST_PORT ?? 5443}/inversorhouse_test`,
    NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
    NEXT_PUBLIC_R2_CLOUDFLARE_URL: `http://localhost:${S3_PORT}/inversorhouse-test-public`,
    R2_ENDPOINT: `http://localhost:${S3_PORT}`,
    R2_PUBLIC_BUCKET: "inversorhouse-test-public",
    R2_PRIVATE_BUCKET: "inversorhouse-test-private",
    R2_ACCESS_KEY_ID: "inversorhouse",
    R2_SECRET_ACCESS_KEY: "inversorhouse-secret",
    ADMIN_EMAILS: process.env.E2E_ADMIN_EMAIL ?? "admin+clerk_test@example.com",
  });
  assertLocalServices("e2e server", { allowOverride: false });

  await servicesUp(["postgres-test", "minio"]);
  const { db, pool } = createDb(process.env.DATABASE_URL!, { max: 1 });
  try {
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await runMigrations(db);
    await seedGeo(db);
    await seedSampleData(db);
  } finally {
    await pool.end();
  }

  if (process.env.SKIP_BUILD !== "1") await run("pnpm", ["next", "build"]);
  await run("pnpm", ["next", "start", "-p", PORT]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
