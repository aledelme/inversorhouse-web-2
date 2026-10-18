import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { municipalities, opportunities, opportunityInterests, users } from "@/db/schema";
import { isVisible } from "@/features/opportunities/server";
import { DomainError } from "@/lib/auth/errors";

/** Business rule #9: one per (opportunity, user); not on your own listing; only visible listings. */
export async function addInterest(userId: string, opportunityId: string) {
  const [target] = await db
    .select({ promoterId: opportunities.promoterId })
    .from(opportunities)
    .innerJoin(users, eq(users.id, opportunities.promoterId))
    .where(and(isVisible(), eq(opportunities.id, opportunityId)));
  if (!target) throw new DomainError("notFound");
  if (target.promoterId === userId) throw new DomainError("ownOpportunity");
  await db.insert(opportunityInterests).values({ opportunityId, userId }).onConflictDoNothing();
}

export async function removeInterest(userId: string, opportunityId: string) {
  await db
    .delete(opportunityInterests)
    .where(
      and(
        eq(opportunityInterests.userId, userId),
        eq(opportunityInterests.opportunityId, opportunityId),
      ),
    );
}

export async function hasInterest(userId: string, opportunityId: string) {
  const [row] = await db
    .select({ userId: opportunityInterests.userId })
    .from(opportunityInterests)
    .where(
      and(
        eq(opportunityInterests.userId, userId),
        eq(opportunityInterests.opportunityId, opportunityId),
      ),
    );
  return Boolean(row);
}

/** Opportunities the user marked "Me interesa" (any status, so they can see what happened). */
export async function listMyInterests(userId: string) {
  return db
    .select({
      opportunityId: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      type: opportunities.type,
      status: opportunities.status,
      municipality: municipalities.name,
      createdAt: opportunityInterests.createdAt,
    })
    .from(opportunityInterests)
    .innerJoin(opportunities, eq(opportunities.id, opportunityInterests.opportunityId))
    .innerJoin(municipalities, eq(municipalities.code, opportunities.municipalityCode))
    .where(eq(opportunityInterests.userId, userId))
    .orderBy(desc(opportunityInterests.createdAt));
}

/** Interested users of one opportunity (Clerk ids only; names/emails are resolved from Clerk). */
export async function listInterestedUsers(opportunityId: string) {
  return db
    .select({ clerkUserId: users.clerkUserId, createdAt: opportunityInterests.createdAt })
    .from(opportunityInterests)
    .innerJoin(users, eq(users.id, opportunityInterests.userId))
    .where(eq(opportunityInterests.opportunityId, opportunityId))
    .orderBy(desc(opportunityInterests.createdAt));
}
