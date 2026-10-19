import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { listAuditLog } from "@/features/admin/server";
import { requireAdminPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.activity");
  return { title: t("title"), robots: { index: false } };
}

async function AdminActivityPageContent() {
  await requireAdminPage();
  const [entries, t] = await Promise.all([listAuditLog(), getTranslations("admin.activity")]);
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <ol className="divide-y rounded-xl border bg-card">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-5"
            >
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDateShort(entry.createdAt)}
              </span>
              <span className="font-medium">{entry.actor}</span>
              <span>{t(`actions.${entry.action.replace(".", "_") as "user_ban"}`)}</span>
              {typeof entry.details?.reason === "string" && (
                <span className="min-w-0 wrap-break-word text-muted-foreground">
                  — {entry.details.reason}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function AdminActivityPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminActivityPageContent />
    </Suspense>
  );
}
