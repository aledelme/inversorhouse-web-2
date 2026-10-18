import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { getCommunities, getProvinces } from "@/features/geo/server";
import { OpportunityGridSkeleton } from "@/features/opportunities";
import { MobileFilters, SearchFilters } from "@/features/search";
import { SearchResults } from "@/features/search/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/oportunidades" },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/oportunidades">) {
  const [communities, provinces, t] = await Promise.all([
    getCommunities(),
    getProvinces(),
    getTranslations("search"),
  ]);
  const filters = <SearchFilters communities={communities} provinces={provinces} />;

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b pb-8">
        <div className="space-y-2">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
        </div>
        <Suspense>
          <MobileFilters>{filters}</MobileFilters>
        </Suspense>
      </header>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Suspense>{filters}</Suspense>
          </div>
        </aside>
        <Suspense fallback={<OpportunityGridSkeleton />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
