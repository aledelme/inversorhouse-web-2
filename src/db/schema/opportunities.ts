import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { opportunityStatusEnum, opportunityTypeEnum, returnKindEnum } from "./enums";
import { autonomousCommunities, municipalities, provinces } from "./geo";
import { users } from "./users";

const percent = (name: string) => numeric(name, { precision: 6, scale: 2, mode: "number" });

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    promoterId: uuid()
      .notNull()
      .references(() => users.id),
    type: opportunityTypeEnum().notNull(),
    status: opportunityStatusEnum().notNull().default("published"),
    title: text().notNull(),
    /** Tiptap JSON document (rich text). Rendered server-side. */
    description: jsonb().$type<Record<string, unknown>>().notNull(),
    /** Plain-text version of the description, for excerpts and search. */
    descriptionText: text().notNull().default(""),
    /** Whole euros. */
    amountToRaise: integer().notNull(),
    /** Whole euros. Null = no minimum ticket. */
    minTicket: integer(),
    termMonths: smallint().notNull(),
    /** When the listing stops being visible. Null = open-ended. */
    closesAt: timestamp({ withTimezone: true }),
    returnKind: returnKindEnum().notNull(),
    // Percentages. For a fixed return min === max.
    returnNominalMin: percent("return_nominal_min").notNull(),
    returnNominalMax: percent("return_nominal_max").notNull(),
    returnAnnualMin: percent("return_annual_min").notNull(),
    returnAnnualMax: percent("return_annual_max").notNull(),
    municipalityCode: text()
      .notNull()
      .references(() => municipalities.code),
    // Denormalised from the municipality so search filters avoid joins.
    provinceCode: text()
      .notNull()
      .references(() => provinces.code),
    communityCode: text()
      .notNull()
      .references(() => autonomousCommunities.code),
    /** Admin-published opportunities are featured (shown first). */
    isFeatured: boolean().notNull().default(false),
    removedReason: text(),
    publishedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("opportunities_listing_idx").on(t.status, t.isFeatured.desc(), t.publishedAt.desc()),
    index().on(t.promoterId),
    index().on(t.municipalityCode),
    index().on(t.provinceCode),
    index().on(t.communityCode),
    index().on(t.type),
    check("opportunities_amount_positive", sql`${t.amountToRaise} > 0`),
    check(
      "opportunities_min_ticket_valid",
      sql`${t.minTicket} IS NULL OR (${t.minTicket} > 0 AND ${t.minTicket} <= ${t.amountToRaise})`,
    ),
    check("opportunities_term_positive", sql`${t.termMonths} > 0`),
    check(
      "opportunities_return_ranges",
      sql`${t.returnNominalMin} <= ${t.returnNominalMax} AND ${t.returnAnnualMin} <= ${t.returnAnnualMax}`,
    ),
  ],
);

export const opportunityImages = pgTable(
  "opportunity_images",
  {
    id: uuid().primaryKey().defaultRandom(),
    opportunityId: uuid()
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    /** Object key in the PUBLIC bucket. */
    storageKey: text().notNull(),
    position: smallint().notNull().default(0),
    width: integer(),
    height: integer(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.opportunityId, t.position)],
);

export const opportunityDocuments = pgTable(
  "opportunity_documents",
  {
    id: uuid().primaryKey().defaultRandom(),
    opportunityId: uuid()
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    /** Object key in the PRIVATE bucket. Only served through signed URLs. */
    storageKey: text().notNull(),
    fileName: text().notNull(),
    sizeBytes: integer().notNull(),
    contentType: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.opportunityId)],
);

/** "Me interesa": an investor shares their Clerk name + email with the promoter. */
export const opportunityInterests = pgTable(
  "opportunity_interests",
  {
    opportunityId: uuid()
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.opportunityId, t.userId] }), index().on(t.userId)],
);

export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type OpportunityImage = typeof opportunityImages.$inferSelect;
export type OpportunityDocument = typeof opportunityDocuments.$inferSelect;
