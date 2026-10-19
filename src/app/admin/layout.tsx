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
      <div className="container-page grid flex-1 content-start gap-6 py-6 lg:grid-cols-[220px_1fr] lg:gap-8 lg:py-12">
        <aside>
          <SectionNav items={[...items]} title={t("title")} />
        </aside>
        <main id="contenido" className="min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
