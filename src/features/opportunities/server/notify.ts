import "server-only";

import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { parseEmailList } from "@/lib/utils/email-list";

import { buildNewOpportunityEmail } from "./announcement";
import { getPublicOpportunity } from "./queries";

/**
 * Emails NEW_OPPORTUNITY_NOTIFY_EMAILS (as BCC) the WhatsApp-ready announcement of a newly
 * published opportunity, with its cover photo attached. Never throws: a failed notification
 * must not affect the publication. Returns whether an email was sent.
 */
export async function notifyNewOpportunity(slug: string) {
  try {
    const recipients = parseEmailList(env.NEW_OPPORTUNITY_NOTIFY_EMAILS);
    if (!recipients.length) return false;

    const opportunity = await getPublicOpportunity(slug);
    if (!opportunity) return false;

    const url = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/oportunidades/${slug}`;
    const cover = opportunity.coverImageUrl;
    return await sendEmail({
      bcc: recipients,
      ...buildNewOpportunityEmail(opportunity, url),
      attachments: cover
        ? [{ filename: new URL(cover).pathname.split("/").pop() || "portada", path: cover }]
        : undefined,
    });
  } catch (error) {
    console.error("Error notifying new opportunity", error instanceof Error ? error.message : "");
    return false;
  }
}
