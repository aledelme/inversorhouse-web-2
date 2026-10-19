import {
  HeartHandshakeIcon,
  LayoutListIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { SectionNav } from "@/components/layout/section-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/config/navigation";
import { isAdmin } from "@/lib/auth";

async function AdminLink() {
  if (!(await isAdmin())) return null;
  const t = await getTranslations("nav");
  return (
    <Link
      href={routes.admin}
      className="mt-4 flex items-center gap-2.5 rounded-lg border border-highlight/50 bg-card px-3 py-2 text-sm font-medium text-highlight-strong hover:bg-accent"
    >
      <ShieldCheckIcon className="size-4" />
      {t("admin")}
    </Link>
  );
}

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const t = await getTranslations("panel");
  const items = [
    {
      href: "/panel/oportunidades",
      label: t("nav.opportunities"),
      icon: <LayoutListIcon className="size-4" />,
      exact: true,
    },
    {
      href: "/panel/oportunidades/nueva",
      label: t("nav.new"),
      icon: <PlusCircleIcon className="size-4" />,
    },
    {
      href: "/panel/intereses",
      label: t("nav.interests"),
      icon: <HeartHandshakeIcon className="size-4" />,
    },
    {
      href: "/panel/perfil",
      label: t("nav.profile"),
      icon: <UserRoundCogIcon className="size-4" />,
    },
  ] as const;

  return (
    <>
      <SiteHeader />
      <div className="container-page grid flex-1 content-start gap-6 py-6 lg:grid-cols-[220px_1fr] lg:gap-8 lg:py-12">
        <aside>
          <SectionNav items={[...items]} title={t("title")}>
            <Suspense fallback={null}>
              <AdminLink />
            </Suspense>
          </SectionNav>
        </aside>
        <main id="contenido" className="min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
