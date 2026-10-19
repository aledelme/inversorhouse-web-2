import "server-only";

import { and, count, desc, eq, gte, ilike, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  adminAuditLog,
  municipalities,
  opportunities,
  opportunityInterests,
  users,
} from "@/db/schema";
import { getUsersBasicInfo, searchClerkUserIds } from "@/features/promoter-profile/server";
import { DomainError } from "@/lib/auth/errors";

import { ADMIN_PAGE_SIZE, pageInfo } from "../paging";

/** ILIKE pattern for "contains", with the wildcard characters of `text` escaped. */
const containsPattern = (text: string) => `%${text.replace(/[\\%_]/g, "\\$&")}%`;

export type AuditAction =
  | "opportunity.remove"
  | "opportunity.restore"
  | "opportunity.feature"
  | "opportunity.unfeature"
  | "user.ban"
  | "user.unban"
  | "report.resolve"
  | "report.dismiss";

export async function logAdminAction(entry: {
  actorId: string;
  action: AuditAction;
  targetType: "opportunity" | "user" | "report";
  targetId: string;
  details?: Record<string, unknown>;
}) {
  await db.insert(adminAuditLog).values(entry);
}

export async function listAuditLog({ page = 1 }: { page?: number } = {}) {
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(adminAuditLog);
  const paging = pageInfo(page, total);
  const rows = await db
    .select({
      id: adminAuditLog.id,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      details: adminAuditLog.details,
      createdAt: adminAuditLog.createdAt,
      actorClerkId: users.clerkUserId,
    })
    .from(adminAuditLog)
    .innerJoin(users, eq(users.id, adminAuditLog.actorId))
    .orderBy(desc(adminAuditLog.createdAt), desc(adminAuditLog.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset(paging.offset);
  const info = await getUsersBasicInfo([...new Set(rows.map((r) => r.actorClerkId))]);
  return {
    items: rows.map(({ actorClerkId, ...row }) => ({
      ...row,
      actor: info.get(actorClerkId)?.name ?? "—",
    })),
    total,
    page: paging.page,
    pageCount: paging.pageCount,
  };
}

export async function getDashboardStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [[published], [totalUsers], [interests]] = await Promise.all([
    db.select({ n: count() }).from(opportunities).where(eq(opportunities.status, "published")),
    db.select({ n: count() }).from(users),
    db
      .select({ n: count() })
      .from(opportunityInterests)
      .where(gte(opportunityInterests.createdAt, since)),
  ]);
  return {
    publishedOpportunities: published?.n ?? 0,
    users: totalUsers?.n ?? 0,
    interestsLast30Days: interests?.n ?? 0,
  };
}

export async function adminListOpportunities(filters: {
  q?: string;
  status?: "published" | "withdrawn" | "removed";
  page?: number;
}) {
  const where = and(
    filters.status ? eq(opportunities.status, filters.status) : undefined,
    filters.q ? ilike(opportunities.title, containsPattern(filters.q)) : undefined,
  );
  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(opportunities)
    .where(where);
  const paging = pageInfo(filters.page ?? 1, total);
  const rows = await db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      type: opportunities.type,
      status: opportunities.status,
      isFeatured: opportunities.isFeatured,
      closesAt: opportunities.closesAt,
      isClosed: sql<boolean>`coalesce(${opportunities.closesAt} < now(), false)`,
      publishedAt: opportunities.publishedAt,
      removedReason: opportunities.removedReason,
      municipality: municipalities.name,
      promoterId: users.id,
      promoterClerkId: users.clerkUserId,
      promoterStatus: users.status,
    })
    .from(opportunities)
    .innerJoin(users, eq(users.id, opportunities.promoterId))
    .innerJoin(municipalities, eq(municipalities.code, opportunities.municipalityCode))
    .where(where)
    .orderBy(desc(opportunities.createdAt), desc(opportunities.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset(paging.offset);
  const info = await getUsersBasicInfo([...new Set(rows.map((r) => r.promoterClerkId))]);
  return {
    items: rows.map(({ promoterClerkId, ...row }) => ({
      ...row,
      promoter: info.get(promoterClerkId) ?? { name: "—", email: null },
    })),
    total,
    page: paging.page,
    pageCount: paging.pageCount,
  };
}

/**
 * Users, newest first. `q` matches name/email/phone through Clerk (PII is not in our DB) or
 * the Clerk id itself (also finds local seed users).
 */
export async function adminListUsers(filters: { q?: string; page?: number } = {}) {
  const q = filters.q?.trim();
  const clerkMatches = q ? await searchClerkUserIds(q) : [];
  const where = q
    ? or(
        clerkMatches.length ? inArray(users.clerkUserId, clerkMatches) : undefined,
        ilike(users.clerkUserId, containsPattern(q)),
      )
    : undefined;
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(users).where(where);
  const paging = pageInfo(filters.page ?? 1, total);
  const rows = await db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      status: users.status,
      bannedReason: users.bannedReason,
      createdAt: users.createdAt,
      opportunityCount: sql<number>`(select count(*)::int from ${opportunities} where ${opportunities.promoterId} = ${users.id})`,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(ADMIN_PAGE_SIZE)
    .offset(paging.offset);
  const info = await getUsersBasicInfo(rows.map((r) => r.clerkUserId));
  return {
    items: rows.map((row) => ({
      ...row,
      ...(info.get(row.clerkUserId) ?? { name: "—", email: null }),
    })),
    total,
    page: paging.page,
    pageCount: paging.pageCount,
  };
}

/** Business rule #7: ban hides all listings (via the visibility query) and blocks the account. */
export async function setUserBanned(userId: string, banned: boolean, reason?: string) {
  const [row] = await db
    .update(users)
    .set(
      banned
        ? { status: "banned", bannedReason: reason ?? null, bannedAt: new Date() }
        : { status: "active", bannedReason: null, bannedAt: null },
    )
    .where(eq(users.id, userId))
    .returning({ id: users.id, clerkUserId: users.clerkUserId });
  if (!row) throw new DomainError("notFound");
  return row;
}

export async function getUsersByIds(ids: string[]) {
  if (!ids.length) return [];
  return db.select().from(users).where(inArray(users.id, ids));
}
