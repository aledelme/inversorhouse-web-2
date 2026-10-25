import { afterEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db/client";
import { opportunityImages } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import type * as envModule from "@/lib/env";
import { publicObjectUrl } from "@/lib/storage";

import { createOpportunityRow, createUser } from "../../../../tests/factories/db";

import { notifyNewOpportunity } from "./notify";

const RECIPIENTS = "Avisos@example.com, otro@example.com";
const overrides = vi.hoisted(() => ({ NEW_OPPORTUNITY_NOTIFY_EMAILS: "" }));

vi.mock("@/lib/env", async (importOriginal) => {
  const { env } = await importOriginal<typeof envModule>();
  return {
    env: new Proxy(env, {
      get: (target, key) =>
        key in overrides ? overrides[key as keyof typeof overrides] : Reflect.get(target, key),
    }),
  };
});
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => true) }));

afterEach(() => {
  overrides.NEW_OPPORTUNITY_NOTIFY_EMAILS = "";
  vi.mocked(sendEmail).mockClear();
});

describe("notifyNewOpportunity", () => {
  it("emails the WhatsApp block (BCC) with the listing link and the cover photo", async () => {
    overrides.NEW_OPPORTUNITY_NOTIFY_EMAILS = RECIPIENTS;
    const promoter = await createUser();
    const row = await createOpportunityRow(promoter.id, { title: "Ático en Málaga" });
    await db.insert(opportunityImages).values([
      { opportunityId: row.id, storageKey: "images/u/portada.webp", position: 0 },
      { opportunityId: row.id, storageKey: "images/u/segunda.webp", position: 1 },
    ]);

    expect(await notifyNewOpportunity(row.slug)).toBe(true);

    expect(sendEmail).toHaveBeenCalledOnce();
    const email = vi.mocked(sendEmail).mock.calls[0]![0];
    expect(email.bcc).toEqual(["avisos@example.com", "otro@example.com"]);
    expect(email.to).toBeUndefined();
    expect(email.subject).toContain("Ático en Málaga");
    expect(email.text).toContain("✅ Ático en Málaga");
    expect(email.text).toContain(`http://localhost:3022/oportunidades/${row.slug}`);
    expect(email.attachments).toEqual([
      { filename: "portada.webp", path: publicObjectUrl("images/u/portada.webp") },
    ]);
  });

  it("sends nothing when no recipients are configured", async () => {
    const promoter = await createUser();
    const row = await createOpportunityRow(promoter.id);

    expect(await notifyNewOpportunity(row.slug)).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends nothing for a listing that is not visible", async () => {
    overrides.NEW_OPPORTUNITY_NOTIFY_EMAILS = RECIPIENTS;
    const banned = await createUser({ status: "banned" });
    const row = await createOpportunityRow(banned.id);

    expect(await notifyNewOpportunity(row.slug)).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("omits the attachment when the listing has no photos", async () => {
    overrides.NEW_OPPORTUNITY_NOTIFY_EMAILS = RECIPIENTS;
    const promoter = await createUser();
    const row = await createOpportunityRow(promoter.id);

    await notifyNewOpportunity(row.slug);
    expect(vi.mocked(sendEmail).mock.calls[0]![0].attachments).toBeUndefined();
  });
});
