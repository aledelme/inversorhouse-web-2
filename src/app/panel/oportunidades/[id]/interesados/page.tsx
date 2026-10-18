import { ArrowLeftIcon, MailIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInterestedInvestors } from "@/features/interests/server";
import { getEditableOpportunity } from "@/features/opportunities/server";
import { DomainError, isAdmin, requireUserPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("panel.interested");
  return { title: t("title"), robots: { index: false } };
}

async function InterestedPageContent({
  params,
}: PageProps<"/panel/oportunidades/[id]/interesados">) {
  const [viewer, { id }, t] = await Promise.all([
    requireUserPage(),
    params,
    getTranslations("panel.interested"),
  ]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  // Ownership check (owner or admin) before reading any personal data.
  const opportunity = await getEditableOpportunity(
    { userId: viewer.userId, isAdmin: await isAdmin() },
    id,
  ).catch((error: unknown) => {
    if (error instanceof DomainError) notFound();
    throw error;
  });
  const investors = await getInterestedInvestors(opportunity.id);

  return (
    <>
      <Link
        href="/panel/oportunidades"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t("back")}
      </Link>
      <PageHeader title={t("title")} description={opportunity.input.title} />
      {investors.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead className="text-right">{t("date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investors.map((investor, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{investor.name}</TableCell>
                  <TableCell>
                    {investor.email ? (
                      <a
                        href={`mailto:${investor.email}`}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <MailIcon className="size-3.5" />
                        {investor.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDateShort(investor.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">{t("privacyNote")}</p>
    </>
  );
}

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function InterestedPage(props: PageProps<"/panel/oportunidades/[id]/interesados">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InterestedPageContent {...props} />
    </Suspense>
  );
}
