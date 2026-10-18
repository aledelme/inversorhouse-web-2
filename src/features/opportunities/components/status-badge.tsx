import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type Status = "published" | "withdrawn" | "removed";

const STYLES: Record<Status | "closed", string> = {
  published: "bg-success/10 text-success ring-success/20",
  withdrawn: "bg-muted text-muted-foreground ring-border",
  removed: "bg-destructive/10 text-destructive ring-destructive/20",
  closed: "bg-highlight/15 text-highlight-strong ring-highlight/30",
};

/**
 * Status as the owner/admin sees it. A published listing past its closing date shows "closed"
 * (`isClosed` is computed in SQL so rendering stays pure).
 */
export function StatusBadge({ status, isClosed = false }: { status: Status; isClosed?: boolean }) {
  const t = useTranslations("status");
  const effective = status === "published" && isClosed ? "closed" : status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        STYLES[effective],
      )}
    >
      {t(effective)}
    </span>
  );
}
