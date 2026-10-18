"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { setOpportunityStatusAction } from "../server/actions";

/** Promoter withdraws (with confirmation) or republishes their listing. */
export function StatusToggle({ id, status }: { id: string; status: "published" | "withdrawn" }) {
  const t = useTranslations("panel.opportunities");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (next: "published" | "withdrawn") =>
    startTransition(async () => {
      const result = await setOpportunityStatusAction(id, next);
      if (!result.ok) {
        toast.error(
          tErrors.has(result.error as never)
            ? tErrors(result.error as never)
            : tErrors("unexpected"),
        );
        return;
      }
      toast.success(next === "published" ? t("republished") : t("withdrawn"));
      router.refresh();
    });

  if (status === "withdrawn") {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run("published")}>
        <EyeIcon />
        {t("republish")}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" disabled={pending}>
          <EyeOffIcon />
          {t("withdraw")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("withdrawTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("withdrawBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => run("withdrawn")}>{t("withdraw")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
