"use server";

import { updateTag } from "next/cache";

import { hasPhone } from "@/features/promoter-profile/server";
import { DomainError, isAdmin, requireUser } from "@/lib/auth";
import { type ActionResult, runAction } from "@/lib/safe-action";

import type { OpportunityInput } from "../schemas";

import { createOpportunity, setStatusByOwner, updateOpportunity } from "./service";
import { OPPORTUNITIES_TAG, opportunityTag } from "./tags";

function invalidate(id: string) {
  updateTag(OPPORTUNITIES_TAG);
  updateTag(opportunityTag(id));
}

export async function createOpportunityAction(
  input: OpportunityInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction(async () => {
    const viewer = await requireUser();
    // Business rule #3: a phone in Clerk is required to publish.
    if (!(await hasPhone(viewer.clerkUserId))) throw new DomainError("phoneRequired");
    const created = await createOpportunity(
      { userId: viewer.userId, isAdmin: await isAdmin() },
      input,
    );
    invalidate(created.id);
    return created;
  });
}

export async function updateOpportunityAction(
  id: string,
  input: OpportunityInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction(async () => {
    const viewer = await requireUser();
    const updated = await updateOpportunity(
      { userId: viewer.userId, isAdmin: await isAdmin() },
      id,
      input,
    );
    invalidate(id);
    return updated;
  });
}

export async function setOpportunityStatusAction(
  id: string,
  status: "published" | "withdrawn",
): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireUser();
    await setStatusByOwner({ userId: viewer.userId, isAdmin: false }, id, status);
    invalidate(id);
  });
}
