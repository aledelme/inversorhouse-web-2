"use server";

import { requireUser } from "@/lib/auth";
import { type ActionResult, runAction } from "@/lib/safe-action";

import type { ReportInput } from "../schemas";

import { createReport } from "./service";

export async function reportOpportunityAction(input: ReportInput): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireUser();
    await createReport(viewer.userId, input);
  });
}
