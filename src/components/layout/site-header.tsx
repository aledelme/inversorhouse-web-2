import Link from "next/link";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { mainNav, routes } from "@/config/navigation";

import { HeaderAuth } from "./header-auth";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const t = useTranslations();
  const items = mainNav.map((item) => ({ href: item.href, label: t(`nav.${item.label}`) }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="container-page flex h-16 items-center gap-3 sm:gap-6">
        <Logo priority />
        <nav aria-label={t("nav.main")} className="hidden flex-1 items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={routes.publish}>{t("common.publish")}</Link>
          </Button>
          <HeaderAuth signInLabel={t("common.signIn")} panelLabel={t("nav.myPanel")} />
          <MobileNav
            items={items}
            publish={{ href: routes.publish, label: t("common.publish") }}
            labels={{ menu: t("common.menu") }}
          />
        </div>
      </div>
    </header>
  );
}
