import "server-only";

import { and, count, desc, eq, gte, ilike, inArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  adminAuditLog,
  municipalities,
  opportunities,
  opportunityInterests,
  users,
} from "@/db/schema";
import { getUsersBasicInfo } from "@/features/promoter-profile/server";
import { DomainError } from "@/lib/auth/errors";

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

export async function listAuditLog(limit = 100) {
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
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(limit);
  const info = await getUsersBasicInfo([...new Set(rows.map((r) => r.actorClerkId))]);
  return rows.map(({ actorClerkId, ...row }) => ({
    ...row,
    actor: info.get(actorClerkId)?.name ?? "—",
  }));
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
}) {
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
    .where(
      and(
        filters.status ? eq(opportunities.status, filters.status) : undefined,
        filters.q
          ? ilike(opportunities.title, `%${filters.q.replace(/[%_]/g, "\\$&")}%`)
          : undefined,
      ),
    )
    .orderBy(desc(opportunities.createdAt))
    .limit(200);
  const info = await getUsersBasicInfo([...new Set(rows.map((r) => r.promoterClerkId))]);
  return rows.map(({ promoterClerkId, ...row }) => ({
    ...row,
    promoter: info.get(promoterClerkId) ?? { name: "—", email: null },
  }));
}

export async function adminListUsers() {
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
    .orderBy(desc(users.createdAt))
    .limit(200);
  const info = await getUsersBasicInfo(rows.map((r) => r.clerkUserId));
  return rows.map((row) => ({
    ...row,
    ...(info.get(row.clerkUserId) ?? { name: "—", email: null }),
  }));
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
