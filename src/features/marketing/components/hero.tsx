import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";

import { QuickSearch, type QuickSearchProps } from "./quick-search";

export function Hero({ provinces }: Pick<QuickSearchProps, "provinces">) {
  const t = useTranslations("home");
  return (
    <section className="relative isolate overflow-hidden bg-inverse text-inverse-foreground">
      <Image
        src={brand.heroImage}
        alt=""
        fill
        preload
        sizes="100vw"
        quality={60}
        className="-z-20 object-cover object-[50%_30%] opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-inverse via-inverse/85 to-inverse/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-inverse to-transparent" />

      <div className="container-page grid gap-12 pt-20 pb-16 sm:pt-28 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:pb-24">
        <div className="max-w-2xl animate-fade-up space-y-7">
          <p className="eyebrow text-highlight">{t("eyebrow")}</p>
          <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{t("title")}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-inverse-foreground/75">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-highlight text-highlight-foreground hover:bg-highlight/90"
            >
              <Link href={routes.search}>{t("ctaExplore")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-inverse-foreground/30 bg-transparent text-inverse-foreground hover:bg-inverse-foreground/10 hover:text-inverse-foreground"
            >
              <Link href="/#promotores">{t("ctaPublish")}</Link>
            </Button>
          </div>
        </div>
        <QuickSearch provinces={provinces} className="animate-fade-up [animation-delay:150ms]" />
      </div>
    </section>
  );
}
