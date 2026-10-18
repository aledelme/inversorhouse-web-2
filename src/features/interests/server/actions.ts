"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { type ActionResult, runAction } from "@/lib/safe-action";

import { addInterest, removeInterest } from "./service";

const opportunityId = z.uuid();

export async function setInterestAction(id: string, interested: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireUser();
    const oid = opportunityId.parse(id);
    if (interested) await addInterest(viewer.userId, oid);
    else await removeInterest(viewer.userId, oid);
  });
}
