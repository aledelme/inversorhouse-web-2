import { createTranslator } from "next-intl";

import { defaultLocale, timeZone } from "@/i18n/config";
import { formatDate, formatEuros, formatPercentRange } from "@/lib/format";

import messages from "../../../../messages/es.json";
import type { OpportunitySummary } from "../types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The "new opportunity" email, recovered from v1: a plain-text block ready to paste into
 * WhatsApp. It carries no promoter data, only the link to the listing (business rule #4).
 */
export function buildNewOpportunityEmail(o: OpportunitySummary, url: string) {
  const t = createTranslator({ locale: defaultLocale, timeZone, messages });

  const typeLabel = t(`opportunityTypes.${o.type}.label`);
  const typeName = t(`opportunityTypes.${o.type}.name`);

  const lines = [
    t("notifications.newOpportunity.heading"),
    "",
    t("notifications.newOpportunity.title", { title: o.title }),
    t("notifications.newOpportunity.type", {
      type: typeLabel === typeName ? typeLabel : `${typeLabel} — ${typeName}`,
    }),
    t("notifications.newOpportunity.location", {
      municipality: o.municipality,
      province: o.province,
    }),
    t("notifications.newOpportunity.amountToRaise", { amount: formatEuros(o.amountToRaise) }),
  ];
  if (o.minTicket) {
    lines.push(t("notifications.newOpportunity.minTicket", { amount: formatEuros(o.minTicket) }));
  }
  lines.push(
    t("notifications.newOpportunity.returns", {
      annual: formatPercentRange(o.returns.annualMin, o.returns.annualMax),
      total: formatPercentRange(o.returns.nominalMin, o.returns.nominalMax),
    }),
    t("notifications.newOpportunity.term", {
      term: t("common.months", { count: o.termMonths }),
    }),
  );
  if (o.closesAt) {
    lines.push(t("notifications.newOpportunity.closesAt", { date: formatDate(o.closesAt) }));
  }
  lines.push("", t("notifications.newOpportunity.link", { url }));

  const text = lines.join("\n");
  const copyHint = t("notifications.newOpportunity.copyHint");
  // No indentation inside <pre>: it would be copied along with the text.
  const html = `<div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 32px;">
<div style="background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px; max-width: 600px; margin: auto;">
<pre style="white-space: pre-wrap; font-family: inherit; font-size: 1rem; background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; border: 1px solid #e5e7eb;">${escapeHtml(text)}</pre>
<p style="margin: 0; color: #666; font-size: 0.95rem;">${escapeHtml(copyHint)}</p>
</div>
</div>`;

  return {
    subject: t("notifications.newOpportunity.subject", { title: o.title }),
    text,
    html,
  };
}
