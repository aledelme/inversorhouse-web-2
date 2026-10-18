/** Drops and recreates the LOCAL database schema, then migrates and seeds. */
import { sql } from "drizzle-orm";

import { createDb } from "../src/db/create";
import { runMigrations } from "../src/db/migrate";

import { assertLocalServices, loadEnv } from "./lib/env";
import { run } from "./lib/run";

async function main() {
  loadEnv(process.env.NODE_ENV === "production" ? "production" : "development");
  assertLocalServices("db:reset", { allowOverride: false });

  const { db, pool } = createDb(process.env.DATABASE_URL!, { max: 1 });
  try {
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await runMigrations(db);
    console.log("✔ schema recreated");
  } finally {
    await pool.end();
  }
  await run("pnpm", ["tsx", "scripts/db-seed.ts"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
