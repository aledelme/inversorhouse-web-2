import "server-only";

import { attachDatabasePool } from "@vercel/functions";

import { env } from "@/lib/env";

import { createDb, type Db } from "./create";

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { __ihDb?: ReturnType<typeof createDb> };
const instance = globalForDb.__ihDb ?? createDb(env.DATABASE_URL);
if (process.env.NODE_ENV !== "production") globalForDb.__ihDb = instance;

// Lets Vercel Fluid compute close idle connections before a function suspends.
attachDatabasePool(instance.pool);

export const db: Db = instance.db;
export type { Db };
