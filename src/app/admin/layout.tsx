import { ActivityIcon, FlagIcon, LayoutDashboardIcon, ListIcon, UsersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionNav } from "@/components/layout/section-nav";
import { SiteHeader } from "@/components/layout/site-header";

/** Static shell; every page calls requireAdminPage() (non-admins get a 404). */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const t = await getTranslations("admin");
  const items = [
    {
      href: "/admin",
      label: t("nav.dashboard"),
      icon: <LayoutDashboardIcon className="size-4" />,
      exact: true,
    },
    {
      href: "/admin/oportunidades",
      label: t("nav.opportunities"),
      icon: <ListIcon className="size-4" />,
    },
    { href: "/admin/denuncias", label: t("nav.reports"), icon: <FlagIcon className="size-4" /> },
    { href: "/admin/usuarios", label: t("nav.users"), icon: <UsersIcon className="size-4" /> },
    {
      href: "/admin/actividad",
      label: t("nav.activity"),
      icon: <ActivityIcon className="size-4" />,
    },
  ] as const;
  return (
    <>
      <SiteHeader />
      <div className="container-page grid flex-1 gap-8 py-8 lg:grid-cols-[220px_1fr] lg:py-12">
        <aside className="space-y-2">
          <p className="hidden px-3 pb-2 eyebrow lg:block">{t("title")}</p>
          <SectionNav items={[...items]} label={t("title")} />
        </aside>
        <main id="contenido" className="min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
