"use client";

import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  removeOpportunityAction,
  restoreOpportunityAction,
  setFeaturedAction,
} from "../server/actions";

import { ReasonDialog } from "./reason-dialog";
import { useAdminAction } from "./use-admin-action";

export function OpportunityAdminActions({
  id,
  slug,
  status,
  isFeatured,
}: {
  id: string;
  slug: string;
  status: "published" | "withdrawn" | "removed";
  isFeatured: boolean;
}) {
  const t = useTranslations("admin.opportunities");
  const { pending, run } = useAdminAction();
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t("actions")} disabled={pending}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "published" && (
            <DropdownMenuItem asChild>
              <Link href={`/oportunidades/${slug}`}>
                <EyeIcon />
                {t("view")}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={`/panel/oportunidades/${id}/editar`}>
              <PencilIcon />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              run(
                () => setFeaturedAction(id, !isFeatured),
                isFeatured ? t("unfeatured") : t("featured"),
              )
            }
          >
            <SparklesIcon />
            {isFeatured ? t("unfeature") : t("feature")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status === "removed" ? (
            <DropdownMenuItem
              onSelect={() => run(() => restoreOpportunityAction(id), t("restored"))}
            >
              <RotateCcwIcon />
              {t("restore")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onSelect={() => setRemoveOpen(true)}>
              <Trash2Icon />
              {t("remove")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReasonDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={t("removeTitle")}
        description={t("removeBody")}
        confirmLabel={t("remove")}
        pending={pending}
        onConfirm={(reason) =>
          run(
            () => removeOpportunityAction(id, reason),
            t("removed"),
            () => setRemoveOpen(false),
          )
        }
      />
    </>
  );
}
