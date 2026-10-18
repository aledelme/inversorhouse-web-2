import {
  BanknoteIcon,
  HammerIcon,
  HandshakeIcon,
  KeyRoundIcon,
  type LucideIcon,
  ShieldIcon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { OPPORTUNITY_TYPES, type OpportunityType } from "@/features/opportunities";

import { SectionHeading } from "./section-heading";

const ICONS: Record<OpportunityType, LucideIcon> = {
  CRV: HammerIcon,
  CRA: KeyRoundIcon,
  OCUPACION: ShieldIcon,
  NPL: BanknoteIcon,
  COINVERSION: HandshakeIcon,
};

export function OperationTypes() {
  const t = useTranslations();
  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow={t("home.types.eyebrow")}
        title={t("home.types.title")}
        subtitle={t("home.types.subtitle")}
      />
      <ul className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-5">
        {OPPORTUNITY_TYPES.map((type) => {
          const Icon = ICONS[type];
          return (
            <li key={type} className="bg-card">
              <Link
                href={{ pathname: "/oportunidades", query: { tipo: type } }}
                className="group flex h-full flex-col gap-4 p-6 transition-colors hover:bg-accent/60"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="eyebrow">{t(`opportunityTypes.${type}.label`)}</span>
                <span className="font-display text-xl leading-snug">
                  {t(`opportunityTypes.${type}.name`)}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {t(`opportunityTypes.${type}.description`)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
