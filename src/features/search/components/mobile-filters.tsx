"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { countActiveFilters, searchParsers } from "../params";

/** Bottom sheet with the same filters, for small screens. */
export function MobileFilters({ children }: { children: React.ReactNode }) {
  const t = useTranslations("search");
  const [state] = useQueryStates(searchParsers);
  const active = countActiveFilters(state);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontalIcon />
          {t("filters")}
          {active > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {active}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{t("filters")}</SheetTitle>
        </SheetHeader>
        <div className="px-4">{children}</div>
        <SheetFooter className="sticky bottom-0 border-t bg-background">
          <SheetTrigger asChild>
            <Button size="lg">{t("showResults")}</Button>
          </SheetTrigger>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
