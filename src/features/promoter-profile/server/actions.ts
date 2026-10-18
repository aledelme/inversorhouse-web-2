"use server";

import { requireUser } from "@/lib/auth";
import { type ActionResult, runAction } from "@/lib/safe-action";

import { contactSettingsSchema, type ContactSettingsInput } from "../schemas";

import { saveContactSettings } from "./contact";

export async function saveContactSettingsAction(
  input: ContactSettingsInput,
): Promise<ActionResult> {
  return runAction(async () => {
    const viewer = await requireUser();
    const settings = contactSettingsSchema.parse(input);
    await saveContactSettings(viewer.clerkUserId, settings);
  });
}
