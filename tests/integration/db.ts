import { sql } from "drizzle-orm";

import { db } from "@/db/client";

/** Wipes everything except the (static) geography tables. */
export async function resetData() {
  await db.execute(sql`
    TRUNCATE admin_audit_log, reports, opportunity_interests, opportunity_documents,
             opportunity_images, opportunities, users RESTART IDENTITY CASCADE
  `);
}

export async function closeTestDb() {
  const globalForDb = globalThis as unknown as { __ihDb?: { pool: { end(): Promise<void> } } };
  await globalForDb.__ihDb?.pool.end();
  delete globalForDb.__ihDb;
}

export { db };
