"use client";

import { CheckIcon, Trash2Icon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { removeOpportunityAction, setReportStatusAction } from "../server/actions";

import { ReasonDialog } from "./reason-dialog";
import { useAdminAction } from "./use-admin-action";

export function ReportAdminActions({
  reportId,
  opportunityId,
  opportunityRemoved,
}: {
  reportId: string;
  opportunityId: string;
  opportunityRemoved: boolean;
}) {
  const t = useTranslations("admin.reports");
  const { pending, run } = useAdminAction();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-1">
      {!opportunityRemoved && (
        <Button size="sm" variant="destructive" disabled={pending} onClick={() => setOpen(true)}>
          <Trash2Icon />
          {t("removeOpportunity")}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => setReportStatusAction(reportId, "resolved"), t("resolved"))}
      >
        <CheckIcon />
        {t("resolve")}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run(() => setReportStatusAction(reportId, "dismissed"), t("dismissed"))}
      >
        <XIcon />
        {t("dismiss")}
      </Button>
      <ReasonDialog
        open={open}
        onOpenChange={setOpen}
        title={t("removeTitle")}
        description={t("removeBody")}
        confirmLabel={t("removeOpportunity")}
        pending={pending}
        onConfirm={(reason) =>
          run(
            async () => {
              const removed = await removeOpportunityAction(opportunityId, reason);
              return removed.ok ? setReportStatusAction(reportId, "resolved") : removed;
            },
            t("resolved"),
            () => setOpen(false),
          )
        }
      />
    </div>
  );
}
