import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pageCount: number;
  /** URL of a given page (keeps the current filters). */
  href: (page: number) => Route;
};

/** Previous / "Página X de Y" / next. Renders nothing when everything fits in one page. */
export function PaginationNav({ page, pageCount, href }: Props) {
  const t = useTranslations("common.pagination");
  if (pageCount <= 1) return null;
  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  return (
    <nav aria-label={t("label")} className="flex items-center justify-between gap-4 pt-4">
      <Button
        asChild
        variant="outline"
        aria-disabled={isFirst}
        className={isFirst ? "pointer-events-none opacity-40" : undefined}
      >
        <Link href={href(Math.max(1, page - 1))} scroll>
          <ChevronLeftIcon />
          <span className="sr-only sm:not-sr-only">{t("previous")}</span>
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">{t("page", { page, total: pageCount })}</span>
      <Button
        asChild
        variant="outline"
        aria-disabled={isLast}
        className={isLast ? "pointer-events-none opacity-40" : undefined}
      >
        <Link href={href(Math.min(pageCount, page + 1))} scroll>
          <span className="sr-only sm:not-sr-only">{t("next")}</span>
          <ChevronRightIcon />
        </Link>
      </Button>
    </nav>
  );
}
