import "server-only";

import { getUsersBasicInfo } from "@/features/promoter-profile/server";

import { listInterestedUsers } from "./service";

/**
 * Interested investors with name + email from Clerk (ADR-0003: not stored by us).
 * Caller must have checked the viewer owns the opportunity (or is admin).
 */
export async function getInterestedInvestors(opportunityId: string) {
  const rows = await listInterestedUsers(opportunityId);
  const info = await getUsersBasicInfo(rows.map((r) => r.clerkUserId));
  return rows.map((row) => ({
    name: info.get(row.clerkUserId)?.name ?? "—",
    email: info.get(row.clerkUserId)?.email ?? null,
    createdAt: row.createdAt,
  }));
}
