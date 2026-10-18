import type { Metadata } from "next";
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
import { UserAdminActions } from "@/features/admin";
import { adminListUsers } from "@/features/admin/server";
import { requireAdminPage } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.users");
  return { title: t("title"), robots: { index: false } };
}

async function AdminUsersPageContent() {
  const viewer = await requireAdminPage();
  const [users, t] = await Promise.all([adminListUsers(), getTranslations("admin.users")]);
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell>{user.opportunityCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateShort(user.createdAt)}
                </TableCell>
                <TableCell>
                  {user.status === "banned" ? (
                    <span className="text-sm text-destructive">
                      {t("bannedLabel")}
                      {user.bannedReason && (
                        <span className="block text-xs text-muted-foreground">
                          {user.bannedReason}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-success">{t("activeLabel")}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {user.id !== viewer.userId && (
                    <UserAdminActions userId={user.id} banned={user.status === "banned"} />
                  )}
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
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminUsersPageContent />
    </Suspense>
  );
}
