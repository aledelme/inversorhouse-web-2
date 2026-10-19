import type { Metadata, Route } from "next";
import Form from "next/form";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { PaginationNav } from "@/components/layout/pagination-nav";
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
import { parsePage, UserAdminActions } from "@/features/admin";
import { adminListUsers } from "@/features/admin/server";
import { requireAdminPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.users");
  return { title: t("title"), robots: { index: false } };
}

async function AdminUsersPageContent({ searchParams }: PageProps<"/admin/usuarios">) {
  const [viewer, sp, t] = await Promise.all([
    requireAdminPage(),
    searchParams,
    getTranslations("admin.users"),
  ]);
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) || undefined : undefined;
  const result = await adminListUsers({ q, page: parsePage(sp.pagina) });
  const users = result.items;
  const pageHref = (page: number) => {
    const query = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(page > 1 ? { pagina: String(page) } : {}),
    }).toString();
    return `/admin/usuarios${query ? `?${query}` : ""}` as Route;
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Form action="/admin/usuarios" className="mb-4 flex w-full gap-2 sm:max-w-md">
        <Input
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
        />
        <Button type="submit" variant="outline">
          {t("search")}
        </Button>
      </Form>
      <p className="mb-3 text-sm text-muted-foreground">{t("count", { count: result.total })}</p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table stackOnMobile>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("opportunities")}</TableHead>
              <TableHead>{t("joined")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="max-md:grid-cols-[auto_auto_minmax(0,1fr)] max-md:gap-x-4 max-md:text-xs"
              >
                <TableCell className="max-md:col-span-3 max-md:text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs break-all text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell className="max-md:row-start-2">
                  <span className="text-muted-foreground md:hidden">{t("opportunities")}: </span>
                  {user.opportunityCount}
                </TableCell>
                <TableCell className="text-muted-foreground max-md:row-start-2">
                  <span className="md:hidden">{t("joined")}: </span>
                  {formatDateShort(user.createdAt)}
                </TableCell>
                <TableCell className="max-md:row-start-2 max-md:text-right">
                  {user.status === "banned" ? (
                    <span className="text-sm text-destructive max-md:text-xs">
                      {t("bannedLabel")}
                      {user.bannedReason && (
                        <span className="block text-xs whitespace-normal text-muted-foreground">
                          {user.bannedReason}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-success max-md:text-xs">{t("activeLabel")}</span>
                  )}
                </TableCell>
                <TableCell className="text-right max-md:col-span-3 max-md:text-left max-md:empty:hidden">
                  {user.id !== viewer.userId && (
                    <UserAdminActions userId={user.id} banned={user.status === "banned"} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationNav page={result.page} pageCount={result.pageCount} href={pageHref} />
    </>
  );
}

/**
 * Reads the session/DB at request time: streamed inside the page's own <Suspense> so
 * navigations between sibling pages stay instant (loading.tsx doesn't cover them).
 */
export default function AdminUsersPage(props: PageProps<"/admin/usuarios">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminUsersPageContent {...props} />
    </Suspense>
  );
}
