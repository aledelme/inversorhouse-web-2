import { MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { formatEuros, formatPercentRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatPlace } from "@/lib/utils/place";

import type { OpportunitySummary } from "../types";

import { FeaturedBadge, TypeBadge } from "./badges";
import { ImagePlaceholder } from "./image-placeholder";

export function OpportunityCard({
  opportunity: o,
  preload = false,
  className,
}: {
  opportunity: OpportunitySummary;
  preload?: boolean;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft transition duration-300 focus-within:ring-2 focus-within:ring-ring hover:-translate-y-1 hover:shadow-lift",
        o.isFeatured && "ring-1 ring-highlight/60",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {o.coverImageUrl ? (
          <Image
            src={o.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            preload={preload}
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <TypeBadge type={o.type} />
          {o.isFeatured && <FeaturedBadge />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" />
          <span className="truncate">{formatPlace(o.municipality, o.province)}</span>
        </p>
        <h3 className="line-clamp-2 text-xl leading-snug">
          <Link
            href={`/oportunidades/${o.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {o.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-4 border-t pt-4">
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
              {t("opportunity.annualReturn")}
            </p>
            <p className="font-display text-2xl leading-tight text-highlight-strong">
              {formatPercentRange(o.returns.annualMin, o.returns.annualMax)}
            </p>
          </div>
          <dl className="space-y-0.5 text-right text-sm">
            <div>
              <dt className="sr-only">{t("opportunity.term")}</dt>
              <dd className="font-medium">{t("common.months", { count: o.termMonths })}</dd>
            </div>
            <div>
              <dt className="sr-only">{t("opportunity.minTicket")}</dt>
              <dd className="text-muted-foreground">
                {o.minTicket
                  ? t("opportunity.fromAmount", { amount: formatEuros(o.minTicket) })
                  : t("opportunity.noMinTicket")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
