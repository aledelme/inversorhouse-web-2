import { FlagIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";
import { getDashboardStats } from "@/features/admin/server";
import { countOpenReports } from "@/features/reports/server";
import { requireAdminPage } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("title"), robots: { index: false } };
}

async function AdminDashboardContent() {
  await requireAdminPage();
  const [stats, openReports, t] = await Promise.all([
    getDashboardStats(),
    countOpenReports(),
    getTranslations("admin.dashboard"),
  ]);
  const cards = [
    { label: t("published"), value: stats.publishedOpportunities },
    { label: t("users"), value: stats.users },
    { label: t("interests"), value: stats.interestsLast30Days },
    { label: t("openReports"), value: openReports },
  ];
  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Button asChild>
            <Link href={routes.publish}>
              <PlusIcon />
              {t("publishFeatured")}
            </Link>
          </Button>
        }
      />
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5 shadow-soft">
            <dt className="text-sm text-muted-foreground">{card.label}</dt>
            <dd className="mt-1 font-display text-4xl text-primary">{card.value}</dd>
          </div>
        ))}
      </dl>
      {openReports > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-highlight/60 bg-highlight/10 p-5">
          <p className="flex items-center gap-2 font-medium">
            <FlagIcon className="size-4 text-highlight-strong" />
            {t("reportsPending", { count: openReports })}
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/denuncias">{t("reviewReports")}</Link>
          </Button>
        </div>
      )}
      <section className="mt-10 max-w-2xl space-y-3 text-sm text-muted-foreground">
        <h2 className="text-xl text-foreground">{t("helpTitle")}</h2>
        <p>{t("helpBody")}</p>
      </section>
    </>
  );
}

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function AdminDashboard() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
