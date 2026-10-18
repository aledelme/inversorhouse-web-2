import { useTranslations } from "next-intl";

import { SectionHeading } from "./section-heading";

const STEPS = ["step1", "step2", "step3"] as const;

function Column({ role }: { role: "investors" | "promoters" }) {
  const t = useTranslations(`home.how.${role}`);
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-soft">
      <h3 className="mb-8 text-2xl">{t("title")}</h3>
      <ol className="space-y-7">
        {STEPS.map((step, index) => (
          <li key={step} className="grid grid-cols-[auto_1fr] gap-5">
            <span className="flex size-10 items-center justify-center rounded-full border border-highlight/60 font-display text-lg text-highlight-strong">
              {index + 1}
            </span>
            <div className="space-y-1">
              <p className="font-medium">{t(`${step}.title`)}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`${step}.body`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HowItWorks() {
  const t = useTranslations("home.how");
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-muted/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Column role="investors" />
          <Column role="promoters" />
        </div>
      </div>
    </section>
  );
}
