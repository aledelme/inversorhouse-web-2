import { ChevronLeftIcon, ChevronRightIcon, SearchXIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { OpportunityGrid } from "@/features/opportunities";
import { searchOpportunities } from "@/features/opportunities/server";

import { loadSearchParams, serializeSearch, toFilters } from "../params";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Reads searchParams (request-time): render inside <Suspense>. */
export async function SearchResults({ searchParams }: Props) {
  const state = await loadSearchParams(searchParams);
  const [result, t] = await Promise.all([
    searchOpportunities(toFilters(state)),
    getTranslations("search"),
  ]);

  const pageHref = (pagina: number) =>
    serializeSearch("/oportunidades", { ...state, pagina: pagina === 1 ? null : pagina }) as Route;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium" role="status">
          {t("results", { count: result.total })}
        </p>
        <p className="text-xs text-muted-foreground">{t("sortedBy")}</p>
      </div>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <SearchXIcon className="size-8 text-muted-foreground" />
          <p className="font-display text-xl">{t("emptyTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("emptyBody")}</p>
        </div>
      ) : (
        <OpportunityGrid
          items={result.items}
          preloadFirst
          className="lg:grid-cols-2 xl:grid-cols-3"
        />
      )}

      {result.pageCount > 1 && (
        <nav
          aria-label={t("pagination.label")}
          className="flex items-center justify-between gap-4 pt-4"
        >
          <Button
            asChild
            variant="outline"
            aria-disabled={result.page <= 1}
            className={result.page <= 1 ? "pointer-events-none opacity-40" : undefined}
          >
            <Link href={pageHref(Math.max(1, result.page - 1))} scroll>
              <ChevronLeftIcon />
              <span className="sr-only sm:not-sr-only">{t("pagination.previous")}</span>
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("pagination.page", { page: result.page, total: result.pageCount })}
          </span>
          <Button
            asChild
            variant="outline"
            aria-disabled={result.page >= result.pageCount}
            className={
              result.page >= result.pageCount ? "pointer-events-none opacity-40" : undefined
            }
          >
            <Link href={pageHref(Math.min(result.pageCount, result.page + 1))} scroll>
              <span className="sr-only sm:not-sr-only">{t("pagination.next")}</span>
              <ChevronRightIcon />
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
