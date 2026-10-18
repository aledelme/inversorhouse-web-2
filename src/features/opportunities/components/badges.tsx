import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import type { OpportunityType } from "../constants";

export function TypeBadge({ type, className }: { type: OpportunityType; className?: string }) {
  const t = useTranslations("opportunityTypes");
  return (
    <span
      title={t(`${type}.name`)}
      className={cn(
        "inline-flex items-center rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-primary uppercase shadow-sm ring-1 ring-primary/10 backdrop-blur",
        className,
      )}
    >
      {t(`${type}.label`)}
    </span>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-semibold tracking-wider text-highlight-foreground uppercase shadow-sm",
        className,
      )}
    >
      <SparklesIcon className="size-3" />
      {t("featured")}
    </span>
  );
}
