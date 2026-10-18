import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";
import { listMyInterests } from "@/features/interests/server";
import { StatusBadge, TypeBadge } from "@/features/opportunities";
import { requireUserPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("panel.interests");
  return { title: t("title"), robots: { index: false } };
}

async function MyInterestsPageContent() {
  const viewer = await requireUserPage();
  const [items, t] = await Promise.all([
    listMyInterests(viewer.userId),
    getTranslations("panel.interests"),
  ]);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button asChild className="mt-6">
            <Link href={routes.search}>{t("explore")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {items.map((item) => (
            <li key={item.opportunityId} className="flex flex-wrap items-center gap-3 p-4">
              <TypeBadge type={item.type} className="bg-secondary shadow-none" />
              <div className="min-w-0 flex-1">
                {item.status === "published" ? (
                  <Link
                    href={`/oportunidades/${item.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-medium text-muted-foreground">{item.title}</span>
                )}
                <p className="text-xs text-muted-foreground">
                  {item.municipality} · {t("since", { date: formatDateShort(item.createdAt) })}
                </p>
              </div>
              {item.status !== "published" && <StatusBadge status={item.status} />}
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
export default function MyInterestsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyInterestsPageContent />
    </Suspense>
  );
}
