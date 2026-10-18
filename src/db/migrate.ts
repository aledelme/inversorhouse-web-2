import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";

import type { Db } from "./create";

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "src/db/migrations");

export function runMigrations(db: Db) {
  return migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
