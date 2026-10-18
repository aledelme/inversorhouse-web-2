import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ReportAdminActions } from "@/features/admin";
import { StatusBadge } from "@/features/opportunities";
import { listReports } from "@/features/reports/server";
import { requireAdminPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.reports");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminReportsPage() {
  await requireAdminPage();
  const [reports, t, tReasons] = await Promise.all([
    listReports("open"),
    getTranslations("admin.reports"),
    getTranslations("report.reasons"),
  ]);
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {reports.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="space-y-3 rounded-xl border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                  {tReasons(report.reason)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateShort(report.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {report.opportunityStatus === "published" ? (
                  <Link
                    href={`/oportunidades/${report.opportunitySlug}`}
                    className="font-medium hover:underline"
                  >
                    {report.opportunityTitle}
                  </Link>
                ) : (
                  <span className="font-medium">{report.opportunityTitle}</span>
                )}
                <StatusBadge status={report.opportunityStatus} />
              </div>
              {report.details && (
                <p className="rounded-lg bg-muted p-3 text-sm">{report.details}</p>
              )}
              <ReportAdminActions
                reportId={report.id}
                opportunityId={report.opportunityId}
                opportunityRemoved={report.opportunityStatus === "removed"}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
