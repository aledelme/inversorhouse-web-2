import { EyeIcon, PencilIcon, PlusIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";
import { StatusBadge, StatusToggle, TypeBadge } from "@/features/opportunities";
import { listOwnOpportunities } from "@/features/opportunities/server";
import { requireUserPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("panel.opportunities");
  return { title: t("title"), robots: { index: false } };
}

async function MyOpportunitiesPageContent() {
  const viewer = await requireUserPage();
  const [items, t] = await Promise.all([
    listOwnOpportunities(viewer.userId),
    getTranslations("panel.opportunities"),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Button asChild>
            <Link href={routes.publish}>
              <PlusIcon />
              {t("new")}
            </Link>
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
          <p className="font-display text-xl">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("emptyBody")}</p>
          <Button asChild className="mt-6">
            <Link href={routes.publish}>{t("new")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-soft md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={o.type} className="bg-secondary shadow-none" />
                  <StatusBadge status={o.status} isClosed={o.isClosed} />
                </div>
                <p className="truncate font-medium">{o.title}</p>
                <p className="text-xs text-muted-foreground">
                  {o.municipality} · {t("publishedOn", { date: formatDateShort(o.publishedAt) })}
                </p>
                {o.status === "removed" && o.removedReason && (
                  <p className="text-xs text-destructive">
                    {t("removedReason", { reason: o.removedReason })}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/panel/oportunidades/${o.id}/interesados`}>
                    <UsersIcon />
                    {t("interested", { count: o.interestCount })}
                  </Link>
                </Button>
                {o.status === "published" && (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/oportunidades/${o.slug}`}>
                      <EyeIcon />
                      {t("view")}
                    </Link>
                  </Button>
                )}
                {o.status !== "removed" && (
                  <>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/panel/oportunidades/${o.id}/editar`}>
                        <PencilIcon />
                        {t("edit")}
                      </Link>
                    </Button>
                    <StatusToggle id={o.id} status={o.status} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function MyOpportunitiesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyOpportunitiesPageContent />
    </Suspense>
  );
}
