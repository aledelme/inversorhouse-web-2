import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { userStatusEnum } from "./enums";

/**
 * Local mirror of a Clerk user. Holds NO personal data (ADR-0003):
 * name, email and phone are always read from Clerk on demand.
 */
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: text().notNull().unique(),
  status: userStatusEnum().notNull().default("active"),
  bannedReason: text(),
  bannedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
