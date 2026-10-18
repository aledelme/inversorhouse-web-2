"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import {
  adminRemove,
  adminRestore,
  adminSetFeatured,
  OPPORTUNITIES_TAG,
  opportunityTag,
} from "@/features/opportunities/server";
import { setReportStatus } from "@/features/reports/server";
import { DomainError, requireAdmin } from "@/lib/auth";
import { clerkClient } from "@/lib/auth/clerk";
import { type ActionResult, runAction } from "@/lib/safe-action";

import { logAdminAction, setUserBanned } from "./service";

const id = z.uuid();
const reason = z.string().trim().min(5, "reasonRequired").max(500, "tooLong");

function invalidateOpportunity(opportunityId: string) {
  updateTag(OPPORTUNITIES_TAG);
  updateTag(opportunityTag(opportunityId));
}

export async function removeOpportunityAction(
  opportunityId: string,
  why: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await requireAdmin();
    const parsed = reason.parse(why);
    const row = await adminRemove(id.parse(opportunityId), parsed);
    await logAdminAction({
      actorId: admin.userId,
      action: "opportunity.remove",
      targetType: "opportunity",
      targetId: row.id,
      details: { reason: parsed },
    });
    invalidateOpportunity(row.id);
  });
}

export async function restoreOpportunityAction(opportunityId: string): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await requireAdmin();
    const row = await adminRestore(id.parse(opportunityId));
    await logAdminAction({
      actorId: admin.userId,
      action: "opportunity.restore",
      targetType: "opportunity",
      targetId: row.id,
    });
    invalidateOpportunity(row.id);
  });
}

export async function setFeaturedAction(
  opportunityId: string,
  featured: boolean,
): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await requireAdmin();
    const row = await adminSetFeatured(id.parse(opportunityId), featured);
    await logAdminAction({
      actorId: admin.userId,
      action: featured ? "opportunity.feature" : "opportunity.unfeature",
      targetType: "opportunity",
      targetId: row.id,
    });
    invalidateOpportunity(row.id);
  });
}

export async function setUserBannedAction(
  userId: string,
  banned: boolean,
  why?: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await requireAdmin();
    const target = id.parse(userId);
    if (target === admin.userId) throw new DomainError("cannotBanSelf");
    const parsedReason = banned ? reason.parse(why ?? "") : undefined;
    const row = await setUserBanned(target, banned, parsedReason);
    // Clerk ban revokes sessions and blocks sign-in (seed users have no Clerk account).
    if (!row.clerkUserId.startsWith("seed_")) {
      const client = await clerkClient();
      if (banned) await client.users.banUser(row.clerkUserId);
      else await client.users.unbanUser(row.clerkUserId);
    }
    await logAdminAction({
      actorId: admin.userId,
      action: banned ? "user.ban" : "user.unban",
      targetType: "user",
      targetId: row.id,
      details: parsedReason ? { reason: parsedReason } : undefined,
    });
    updateTag(OPPORTUNITIES_TAG);
  });
}

export async function setReportStatusAction(
  reportId: string,
  status: "resolved" | "dismissed",
): Promise<ActionResult> {
  return runAction(async () => {
    const admin = await requireAdmin();
    const row = await setReportStatus(admin.userId, id.parse(reportId), status);
    await logAdminAction({
      actorId: admin.userId,
      action: status === "resolved" ? "report.resolve" : "report.dismiss",
      targetType: "report",
      targetId: row.id,
      details: { opportunityId: row.opportunityId },
    });
  });
}
