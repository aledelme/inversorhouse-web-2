import { SearchXIcon } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";

import { PaginationNav } from "@/components/layout/pagination-nav";
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

      <PaginationNav page={result.page} pageCount={result.pageCount} href={pageHref} />
    </div>
  );
}
