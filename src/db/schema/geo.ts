import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Spanish administrative geography, keyed by official INE codes.
 * Seeded from src/db/seed/data/*.json — never edited by the app.
 */
export const autonomousCommunities = pgTable("autonomous_communities", {
  code: text().primaryKey(), // INE CCAA code, 2 digits ("01".."19")
  name: text().notNull(),
  slug: text().notNull().unique(),
});

export const provinces = pgTable(
  "provinces",
  {
    code: text().primaryKey(), // INE province code, 2 digits ("01".."52")
    name: text().notNull(),
    slug: text().notNull().unique(),
    communityCode: text()
      .notNull()
      .references(() => autonomousCommunities.code),
  },
  (t) => [index().on(t.communityCode)],
);

export const municipalities = pgTable(
  "municipalities",
  {
    code: text().primaryKey(), // INE municipality code, 5 digits (province + 3)
    name: text().notNull(),
    slug: text().notNull(),
    provinceCode: text()
      .notNull()
      .references(() => provinces.code),
  },
  (t) => [index().on(t.provinceCode), uniqueIndex().on(t.provinceCode, t.slug)],
);

export type AutonomousCommunity = typeof autonomousCommunities.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type Municipality = typeof municipalities.$inferSelect;
