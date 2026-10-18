import { useTranslations } from "next-intl";

import { formatDate, formatEuros, formatPercentRange } from "@/lib/format";

import type { OpportunitySummary } from "../types";

/** The numbers investors compare: annual return first. */
export function KeyFigures({ opportunity: o }: { opportunity: OpportunitySummary }) {
  const t = useTranslations();
  const rows: [string, string][] = [
    [t("opportunity.totalReturn"), formatPercentRange(o.returns.nominalMin, o.returns.nominalMax)],
    [t("opportunity.term"), t("common.months", { count: o.termMonths })],
    [t("opportunity.amountToRaise"), formatEuros(o.amountToRaise)],
    [
      t("opportunity.minTicket"),
      o.minTicket ? formatEuros(o.minTicket) : t("opportunity.noMinTicket"),
    ],
    [t("opportunity.closesAt"), o.closesAt ? formatDate(o.closesAt) : t("opportunity.openEnded")],
  ];
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">{t("opportunity.annualReturn")}</p>
        <p className="font-display text-4xl text-primary">
          {formatPercentRange(o.returns.annualMin, o.returns.annualMax)}
        </p>
      </div>
      <dl className="divide-y border-y">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">{t("opportunity.returnsNote")}</p>
    </div>
  );
}
