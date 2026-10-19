import { SparklesIcon } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OpportunityAdminActions } from "@/features/admin";
import { adminListOpportunities } from "@/features/admin/server";
import { StatusBadge, TypeBadge } from "@/features/opportunities";
import { requireAdminPage } from "@/lib/auth";
import { cn } from "@/lib/utils";

const STATUSES = ["published", "withdrawn", "removed"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.opportunities");
  return { title: t("title"), robots: { index: false } };
}

async function AdminOpportunitiesPageContent({ searchParams }: PageProps<"/admin/oportunidades">) {
  const [, sp, t, tStatus] = await Promise.all([
    requireAdminPage(),
    searchParams,
    getTranslations("admin.opportunities"),
    getTranslations("status"),
  ]);
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : undefined;
  const status = STATUSES.find((s) => s === sp.estado);
  const items = await adminListOpportunities({ q, status });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Form action="/admin/oportunidades" className="flex w-full gap-2 sm:w-auto sm:flex-1">
          {status && <input type="hidden" name="estado" value={status} />}
          <Input
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            className="sm:max-w-sm"
          />
          <Button type="submit" variant="outline">
            {t("search")}
          </Button>
        </Form>
        <nav className="flex flex-wrap gap-1" aria-label={t("filterByStatus")}>
          <Link
            href={{ pathname: "/admin/oportunidades", query: q ? { q } : {} }}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              !status ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {t("all")}
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={{ pathname: "/admin/oportunidades", query: { ...(q ? { q } : {}), estado: s } }}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                status === s ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {tStatus(s)}
            </Link>
          ))}
        </nav>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table stackOnMobile>
          <TableHeader>
            <TableRow>
              <TableHead>{t("opportunity")}</TableHead>
              <TableHead>{t("promoter")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
            {items.map((o) => (
              <TableRow key={o.id} className="max-md:grid-cols-[minmax(0,1fr)_auto]">
                <TableCell className="max-w-md max-md:max-w-none">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={o.type} className="bg-secondary shadow-none" />
                    {o.isFeatured && (
                      <SparklesIcon
                        className="size-4 text-highlight-strong"
                        aria-label={t("featuredLabel")}
                      />
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium max-md:wrap-break-word max-md:whitespace-normal">
                    {o.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{o.municipality}</p>
                </TableCell>
                <TableCell className="max-md:col-span-2 max-md:row-start-2">
                  <p className="text-sm">{o.promoter.name}</p>
                  <p className="text-xs break-all text-muted-foreground">{o.promoter.email}</p>
                  {o.promoterStatus === "banned" && (
                    <p className="text-xs text-destructive">{t("promoterBanned")}</p>
                  )}
                </TableCell>
                <TableCell className="max-md:col-span-2 max-md:row-start-3">
                  <StatusBadge status={o.status} isClosed={o.isClosed} />
                  {o.removedReason && (
                    <p className="mt-1 max-w-48 text-xs whitespace-normal text-muted-foreground max-md:max-w-none">
                      {o.removedReason}
                    </p>
                  )}
                </TableCell>
                <TableCell className="max-md:col-start-2 max-md:row-start-1 max-md:self-start">
                  <OpportunityAdminActions
                    id={o.id}
                    slug={o.slug}
                    status={o.status}
                    isFeatured={o.isFeatured}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function AdminOpportunitiesPage(props: PageProps<"/admin/oportunidades">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminOpportunitiesPageContent {...props} />
    </Suspense>
  );
}
