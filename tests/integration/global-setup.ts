import { execSync } from "node:child_process";

import { sql } from "drizzle-orm";

import { createDb } from "../../src/db/create";
import { runMigrations } from "../../src/db/migrate";
import { seedGeo } from "../../src/db/seed/geo";

const compose = "docker compose -f docker/compose.yml";
const TEST_DB = `postgres://inversorhouse:inversorhouse@localhost:${process.env.IH_PG_TEST_PORT ?? 5443}/inversorhouse_test`;

/** Starts the throw-away services and prepares a fresh schema once per run. */
export default async function setup() {
  execSync(`${compose} up -d --wait postgres-test minio`, { stdio: "inherit" });
  execSync(`${compose} run --rm minio-init`, { stdio: "ignore" });

  const { db, pool } = createDb(TEST_DB, { max: 1 });
  try {
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await runMigrations(db);
    await seedGeo(db);
  } finally {
    await pool.end();
  }
}
