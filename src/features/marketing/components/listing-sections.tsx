import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";
import { OpportunityGrid } from "@/features/opportunities";
import {
  listFeaturedOpportunities,
  listLatestOpportunities,
} from "@/features/opportunities/server";

import { SectionHeading } from "./section-heading";

export async function FeaturedSection() {
  const [items, t] = await Promise.all([listFeaturedOpportunities(3), getTranslations("home")]);
  if (items.length === 0) return null;
  return (
    <section className="container-page pt-20 sm:pt-24">
      <SectionHeading eyebrow={t("featured.eyebrow")} title={t("featured.title")} />
      <OpportunityGrid items={items} />
    </section>
  );
}

export async function LatestSection() {
  const [items, t, tc] = await Promise.all([
    listLatestOpportunities(6),
    getTranslations("home"),
    getTranslations("common"),
  ]);
  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow={t("latest.eyebrow")}
        title={t("latest.title")}
        action={
          <Button asChild variant="outline">
            <Link href={routes.search}>
              {tc("viewAll")}
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />
      {items.length > 0 ? (
        <OpportunityGrid items={items} />
      ) : (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {t("latest.empty")}
        </p>
      )}
    </section>
  );
}
