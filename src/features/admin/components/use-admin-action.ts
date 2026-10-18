"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/safe-action";

/** Runs an admin server action with toasts + refresh. */
export function useAdminAction() {
  const router = useRouter();
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>, successMessage: string, onDone?: () => void) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        const key = result.fieldErrors ? Object.values(result.fieldErrors)[0]?.[0] : result.error;
        toast.error(
          key && tErrors.has(key as never) ? tErrors(key as never) : tErrors("unexpected"),
        );
        return;
      }
      toast.success(successMessage);
      onDone?.();
      router.refresh();
    });

  return { pending, run };
}
