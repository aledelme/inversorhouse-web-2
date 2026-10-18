"use client";

import { CheckIcon, HeartHandshakeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { setInterestAction } from "../server/actions";

/** "Me interesa": shares the investor's name + email with the promoter (explicit notice). */
export function InterestButton({
  opportunityId,
  initialInterested,
}: {
  opportunityId: string;
  initialInterested: boolean;
}) {
  const t = useTranslations("interest");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  const [interested, setOptimistic] = useOptimistic(initialInterested);

  const toggle = () =>
    startTransition(async () => {
      const next = !interested;
      setOptimistic(next);
      const result = await setInterestAction(opportunityId, next);
      if (!result.ok) {
        toast.error(
          tErrors.has(result.error as never)
            ? tErrors(result.error as never)
            : tErrors("unexpected"),
        );
        return;
      }
      toast.success(next ? t("added") : t("removed"));
    });

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        variant={interested ? "secondary" : "default"}
        className="w-full"
        onClick={toggle}
        disabled={pending}
        aria-pressed={interested}
      >
        {interested ? <CheckIcon /> : <HeartHandshakeIcon />}
        {interested ? t("active") : t("cta")}
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {interested ? t("activeHint") : t("consent")}
      </p>
    </div>
  );
}
