import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/client";
import {
  autonomousCommunities,
  municipalities,
  opportunities,
  opportunityDocuments,
  opportunityImages,
  provinces,
  users,
} from "@/db/schema";
import { publicObjectUrl } from "@/lib/storage/public-url";

import { PAGE_SIZE } from "../constants";
import type {
  OpportunityDetail,
  OpportunityFilters,
  OpportunityPage,
  OpportunitySummary,
} from "../types";

import { OPPORTUNITIES_TAG, opportunityTag } from "./tags";

/**
 * Business rule #1 (docs/domain.md): published, not closed, promoter not banned.
 * Requires `users` to be joined.
 */
export function isVisible(): SQL {
  return and(
    eq(opportunities.status, "published"),
    or(isNull(opportunities.closesAt), gt(opportunities.closesAt, sql`now()`)),
    eq(users.status, "active"),
  )!;
}

const coverKey = sql<string | null>`(
  select ${opportunityImages.storageKey} from ${opportunityImages}
  where ${opportunityImages.opportunityId} = ${opportunities.id}
  order by ${opportunityImages.position} asc limit 1
)`;

const summaryColumns = {
  id: opportunities.id,
  slug: opportunities.slug,
  type: opportunities.type,
  title: opportunities.title,
  descriptionText: opportunities.descriptionText,
  amountToRaise: opportunities.amountToRaise,
  minTicket: opportunities.minTicket,
  termMonths: opportunities.termMonths,
  returnKind: opportunities.returnKind,
  returnNominalMin: opportunities.returnNominalMin,
  returnNominalMax: opportunities.returnNominalMax,
  returnAnnualMin: opportunities.returnAnnualMin,
  returnAnnualMax: opportunities.returnAnnualMax,
  municipality: municipalities.name,
  province: provinces.name,
  coverKey,
  isFeatured: opportunities.isFeatured,
  publishedAt: opportunities.publishedAt,
  closesAt: opportunities.closesAt,
};

function excerpt(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function baseSummaryQuery() {
  return db
    .select(summaryColumns)
    .from(opportunities)
    .innerJoin(users, eq(users.id, opportunities.promoterId))
    .innerJoin(municipalities, eq(municipalities.code, opportunities.municipalityCode))
    .innerJoin(provinces, eq(provinces.code, opportunities.provinceCode));
}

type SummaryRow = Awaited<ReturnType<typeof baseSummaryQuery>>[number];

function toSummary(row: SummaryRow): OpportunitySummary {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    title: row.title,
    excerpt: excerpt(row.descriptionText),
    amountToRaise: row.amountToRaise,
    minTicket: row.minTicket,
    termMonths: row.termMonths,
    returns: {
      kind: row.returnKind,
      nominalMin: row.returnNominalMin,
      nominalMax: row.returnNominalMax,
      annualMin: row.returnAnnualMin,
      annualMax: row.returnAnnualMax,
    },
    municipality: row.municipality,
    province: row.province,
    coverImageUrl: row.coverKey ? publicObjectUrl(row.coverKey) : null,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt,
    closesAt: row.closesAt,
  };
}

function filterConditions(filters: OpportunityFilters): SQL {
  return and(
    isVisible(),
    filters.types?.length ? inArray(opportunities.type, filters.types) : undefined,
    filters.community ? eq(opportunities.communityCode, filters.community) : undefined,
    filters.province ? eq(opportunities.provinceCode, filters.province) : undefined,
    filters.municipality ? eq(opportunities.municipalityCode, filters.municipality) : undefined,
    filters.maxTicket
      ? or(isNull(opportunities.minTicket), lte(opportunities.minTicket, filters.maxTicket))
      : undefined,
  )!;
}

/** Search results: featured first, then most recent (business rule #2). */
export async function searchOpportunities(filters: OpportunityFilters): Promise<OpportunityPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag(OPPORTUNITIES_TAG);

  const where = filterConditions(filters);
  const page = Math.max(1, filters.page ?? 1);
  const [rows, [totals]] = await Promise.all([
    baseSummaryQuery()
      .where(where)
      .orderBy(
        desc(opportunities.isFeatured),
        desc(opportunities.publishedAt),
        asc(opportunities.id),
      )
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(opportunities)
      .innerJoin(users, eq(users.id, opportunities.promoterId))
      .where(where),
  ]);
  const total = totals?.total ?? 0;
  return {
    items: rows.map(toSummary),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Admin-published (featured) opportunities for the home page. */
export async function listFeaturedOpportunities(limit = 3): Promise<OpportunitySummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(OPPORTUNITIES_TAG);
  const rows = await baseSummaryQuery()
    .where(and(isVisible(), eq(opportunities.isFeatured, true)))
    .orderBy(desc(opportunities.publishedAt))
    .limit(limit);
  return rows.map(toSummary);
}

export async function listLatestOpportunities(limit = 6): Promise<OpportunitySummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(OPPORTUNITIES_TAG);
  const rows = await baseSummaryQuery()
    .where(isVisible())
    .orderBy(desc(opportunities.publishedAt))
    .limit(limit);
  return rows.map(toSummary);
}

/** Public detail of a visible opportunity, or null (→ 404). */
export async function getPublicOpportunity(slug: string): Promise<OpportunityDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(OPPORTUNITIES_TAG);

  const [row] = await baseSummaryQuery().where(and(isVisible(), eq(opportunities.slug, slug)));
  if (!row) return null;
  cacheTag(opportunityTag(row.id));

  const [extra] = await db
    .select({
      description: opportunities.description,
      municipalityCode: opportunities.municipalityCode,
      promoterUserId: opportunities.promoterId,
      community: autonomousCommunities.name,
    })
    .from(opportunities)
    .innerJoin(autonomousCommunities, eq(autonomousCommunities.code, opportunities.communityCode))
    .where(eq(opportunities.id, row.id));

  const [images, [docs]] = await Promise.all([
    db
      .select({
        id: opportunityImages.id,
        storageKey: opportunityImages.storageKey,
        width: opportunityImages.width,
        height: opportunityImages.height,
      })
      .from(opportunityImages)
      .where(eq(opportunityImages.opportunityId, row.id))
      .orderBy(asc(opportunityImages.position)),
    db
      .select({ n: count() })
      .from(opportunityDocuments)
      .where(eq(opportunityDocuments.opportunityId, row.id)),
  ]);

  return {
    ...toSummary(row),
    description: extra!.description,
    community: extra!.community,
    municipalityCode: extra!.municipalityCode,
    promoterUserId: extra!.promoterUserId,
    images: images.map((img) => ({
      id: img.id,
      url: publicObjectUrl(img.storageKey),
      width: img.width,
      height: img.height,
    })),
    documentCount: docs?.n ?? 0,
  };
}

/** Request-time visibility check (e.g. before serving a document). Uncached. */
export async function isOpportunityVisible(id: string): Promise<boolean> {
  const [row] = await db
    .select({ id: opportunities.id })
    .from(opportunities)
    .innerJoin(users, eq(users.id, opportunities.promoterId))
    .where(and(isVisible(), eq(opportunities.id, id)));
  return Boolean(row);
}

/** Owner (local users.id) of an opportunity, or null. */
export async function getOpportunityOwnerId(id: string): Promise<string | null> {
  const [row] = await db
    .select({ promoterId: opportunities.promoterId })
    .from(opportunities)
    .where(eq(opportunities.id, id));
  return row?.promoterId ?? null;
}

/** Slugs for the sitemap. */
export async function listVisibleSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(OPPORTUNITIES_TAG);
  return db
    .select({ slug: opportunities.slug, updatedAt: opportunities.updatedAt })
    .from(opportunities)
    .innerJoin(users, eq(users.id, opportunities.promoterId))
    .where(isVisible());
}
