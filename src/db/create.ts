import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

/**
 * Builds a Drizzle client. Used by the app (`./client`), scripts and tests.
 * Kept free of `server-only` / env imports so plain Node can load it.
 */
export function createDb(connectionString: string, options: { max?: number } = {}) {
  const pool = new Pool({ connectionString, max: options.max ?? 10 });
  const db = drizzle({ client: pool, schema, casing: "snake_case" });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
