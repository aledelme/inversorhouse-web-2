import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { reportReasonEnum, reportStatusEnum } from "./enums";
import { opportunities } from "./opportunities";
import { users } from "./users";

/** A signed-in user flags an opportunity for admin review. */
export const reports = pgTable(
  "reports",
  {
    id: uuid().primaryKey().defaultRandom(),
    opportunityId: uuid()
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    reporterId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: reportReasonEnum().notNull(),
    details: text(),
    status: reportStatusEnum().notNull().default("open"),
    resolvedById: uuid().references(() => users.id),
    resolvedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.opportunityId, t.reporterId), index().on(t.status, t.createdAt)],
);

/** Append-only record of every admin action. */
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    actorId: uuid()
      .notNull()
      .references(() => users.id),
    action: text().notNull(),
    targetType: text().notNull(),
    targetId: text().notNull(),
    details: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.createdAt)],
);

export type Report = typeof reports.$inferSelect;
export type AdminAuditEntry = typeof adminAuditLog.$inferSelect;
