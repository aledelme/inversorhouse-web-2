"use client";

import { BanIcon, UndoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { setUserBannedAction } from "../server/actions";

import { ReasonDialog } from "./reason-dialog";
import { useAdminAction } from "./use-admin-action";

export function UserAdminActions({ userId, banned }: { userId: string; banned: boolean }) {
  const t = useTranslations("admin.users");
  const { pending, run } = useAdminAction();
  const [open, setOpen] = useState(false);

  if (banned) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => setUserBannedAction(userId, false), t("unbanned"))}
      >
        <UndoIcon />
        {t("unban")}
      </Button>
    );
  }
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <BanIcon />
        {t("ban")}
      </Button>
      <ReasonDialog
        open={open}
        onOpenChange={setOpen}
        title={t("banTitle")}
        description={t("banBody")}
        confirmLabel={t("ban")}
        pending={pending}
        onConfirm={(reason) =>
          run(
            () => setUserBannedAction(userId, true, reason),
            t("banned"),
            () => setOpen(false),
          )
        }
      />
    </>
  );
}
