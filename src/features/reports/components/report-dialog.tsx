"use client";

import { FlagIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import { REPORT_REASONS, type ReportReason } from "../schemas";
import { reportOpportunityAction } from "../server/actions";

export function ReportDialog({ opportunityId }: { opportunityId: string }) {
  const t = useTranslations("report");
  const tErrors = useTranslations("errors");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      if (!reason) return;
      const result = await reportOpportunityAction({ opportunityId, reason, details });
      if (!result.ok) {
        toast.error(
          tErrors.has(result.error as never)
            ? tErrors(result.error as never)
            : tErrors("unexpected"),
        );
        return;
      }
      toast.success(t("sent"));
      setOpen(false);
      setReason("");
      setDetails("");
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <FlagIcon />
          {t("cta")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={reason}
          onValueChange={(v) => setReason(v as ReportReason)}
          className="grid gap-2"
        >
          {REPORT_REASONS.map((r) => (
            <Label
              key={r}
              htmlFor={`reason-${r}`}
              className="flex cursor-pointer items-center gap-3 font-normal"
            >
              <RadioGroupItem id={`reason-${r}`} value={r} />
              {t(`reasons.${r}`)}
            </Label>
          ))}
        </RadioGroup>
        <div className="grid gap-2">
          <Label htmlFor="report-details">{t("details")}</Label>
          <Textarea
            id="report-details"
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={!reason || pending}>
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
