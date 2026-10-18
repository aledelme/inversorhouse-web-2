import { relations } from "drizzle-orm";

import { autonomousCommunities, municipalities, provinces } from "./geo";
import { reports } from "./moderation";
import {
  opportunities,
  opportunityDocuments,
  opportunityImages,
  opportunityInterests,
} from "./opportunities";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  opportunities: many(opportunities),
  interests: many(opportunityInterests),
}));

export const provincesRelations = relations(provinces, ({ one, many }) => ({
  community: one(autonomousCommunities, {
    fields: [provinces.communityCode],
    references: [autonomousCommunities.code],
  }),
  municipalities: many(municipalities),
}));

export const municipalitiesRelations = relations(municipalities, ({ one }) => ({
  province: one(provinces, {
    fields: [municipalities.provinceCode],
    references: [provinces.code],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  promoter: one(users, { fields: [opportunities.promoterId], references: [users.id] }),
  municipality: one(municipalities, {
    fields: [opportunities.municipalityCode],
    references: [municipalities.code],
  }),
  province: one(provinces, {
    fields: [opportunities.provinceCode],
    references: [provinces.code],
  }),
  community: one(autonomousCommunities, {
    fields: [opportunities.communityCode],
    references: [autonomousCommunities.code],
  }),
  images: many(opportunityImages),
  documents: many(opportunityDocuments),
  interests: many(opportunityInterests),
  reports: many(reports),
}));

export const opportunityImagesRelations = relations(opportunityImages, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunityImages.opportunityId],
    references: [opportunities.id],
  }),
}));

export const opportunityDocumentsRelations = relations(opportunityDocuments, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunityDocuments.opportunityId],
    references: [opportunities.id],
  }),
}));

export const opportunityInterestsRelations = relations(opportunityInterests, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunityInterests.opportunityId],
    references: [opportunities.id],
  }),
  user: one(users, { fields: [opportunityInterests.userId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [reports.opportunityId],
    references: [opportunities.id],
  }),
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
}));
