import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";

export function PromoterCta() {
  const t = useTranslations("home.promoterCta");
  return (
    <section id="promotores" className="container-page scroll-mt-20 py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground sm:px-14">
        <div className="absolute -top-24 -right-24 size-72 rounded-full border border-highlight/30" />
        <div className="absolute -top-10 -right-10 size-44 rounded-full border border-highlight/20" />
        <div className="relative max-w-2xl space-y-5">
          <p className="eyebrow text-highlight">{t("eyebrow")}</p>
          <h2 className="text-3xl leading-tight sm:text-4xl">{t("title")}</h2>
          <p className="text-primary-foreground/75">{t("body")}</p>
          <Button
            asChild
            size="lg"
            className="bg-highlight text-highlight-foreground hover:bg-highlight/90"
          >
            <Link href={routes.publish}>
              {t("cta")}
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
