import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { opportunities, reports } from "@/db/schema";
import { DomainError } from "@/lib/auth/errors";

import { type ReportInput, reportInputSchema } from "../schemas";

/** Business rule #10: one report per (opportunity, user). Re-reporting updates the reason. */
export async function createReport(userId: string, input: ReportInput) {
  const data = reportInputSchema.parse(input);
  const [target] = await db
    .select({ promoterId: opportunities.promoterId })
    .from(opportunities)
    .where(eq(opportunities.id, data.opportunityId));
  if (!target) throw new DomainError("notFound");
  if (target.promoterId === userId) throw new DomainError("ownOpportunity");
  await db
    .insert(reports)
    .values({
      opportunityId: data.opportunityId,
      reporterId: userId,
      reason: data.reason,
      details: data.details,
    })
    .onConflictDoUpdate({
      target: [reports.opportunityId, reports.reporterId],
      set: {
        reason: data.reason,
        details: data.details ?? null,
        status: "open",
        resolvedAt: null,
        resolvedById: null,
      },
    });
}

export async function listReports(status: "open" | "resolved" | "dismissed" = "open") {
  return db
    .select({
      id: reports.id,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      opportunityId: opportunities.id,
      opportunitySlug: opportunities.slug,
      opportunityTitle: opportunities.title,
      opportunityStatus: opportunities.status,
    })
    .from(reports)
    .innerJoin(opportunities, eq(opportunities.id, reports.opportunityId))
    .where(eq(reports.status, status))
    .orderBy(desc(reports.createdAt));
}

export async function countOpenReports() {
  const [row] = await db.select({ n: count() }).from(reports).where(eq(reports.status, "open"));
  return row?.n ?? 0;
}

export async function setReportStatus(
  adminUserId: string,
  reportId: string,
  status: "resolved" | "dismissed",
) {
  const [row] = await db
    .update(reports)
    .set({ status, resolvedById: adminUserId, resolvedAt: new Date() })
    .where(and(eq(reports.id, reportId)))
    .returning({ id: reports.id, opportunityId: reports.opportunityId });
  if (!row) throw new DomainError("notFound");
  return row;
}
