/**
 * Applies pending migrations from src/db/migrations.
 * Runs locally (guarded) and in the Vercel build (VERCEL=1).
 */
import { createDb } from "../src/db/create";
import { runMigrations } from "../src/db/migrate";

import { assertLocalServices, loadEnv } from "./lib/env";

async function main() {
  loadEnv(process.env.NODE_ENV === "production" ? "production" : "development");
  if (process.env.VERCEL !== "1") assertLocalServices("db:migrate");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const { db, pool } = createDb(process.env.DATABASE_URL, { max: 1 });
  try {
    await runMigrations(db);
    console.log("✔ migrations applied");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
