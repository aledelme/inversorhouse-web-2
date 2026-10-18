import { useTranslations } from "next-intl";

import { brand } from "@/config/brand";
import { formatDate } from "@/lib/format";

/** Typographic wrapper for long legal texts. */
export function LegalDocument({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTranslations("legal");
  return (
    <article className="container-page max-w-3xl py-14 sm:py-20">
      <header className="mb-10 space-y-3 border-b pb-8">
        <h1 className="text-4xl">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {t("updated", { date: formatDate(new Date(brand.legalUpdatedAt)) })}
        </p>
      </header>
      <div className="space-y-8 leading-relaxed text-foreground/90 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-sans [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}
