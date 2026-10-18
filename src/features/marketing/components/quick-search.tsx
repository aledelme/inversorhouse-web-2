import { SearchIcon } from "lucide-react";
import Form from "next/form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/config/navigation";
import type { ProvinceOption } from "@/features/geo";
import { OPPORTUNITY_TYPES } from "@/features/opportunities";
import { cn } from "@/lib/utils";

export type QuickSearchProps = { provinces: ProvinceOption[]; className?: string };

/** GET form to /oportunidades — works without JS (next/form). */
export function QuickSearch({ provinces, className }: QuickSearchProps) {
  const t = useTranslations();
  return (
    <Form
      action={routes.search}
      className={cn(
        "grid gap-4 rounded-2xl border border-inverse-foreground/10 bg-card/95 p-6 text-card-foreground shadow-lift backdrop-blur",
        className,
      )}
    >
      <div className="grid gap-2">
        <Label htmlFor="qs-type">{t("home.quickSearch.type")}</Label>
        <Select name="tipo">
          <SelectTrigger id="qs-type" className="w-full">
            <SelectValue placeholder={t("home.quickSearch.anyType")} />
          </SelectTrigger>
          <SelectContent>
            {OPPORTUNITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`opportunityTypes.${type}.label`)} · {t(`opportunityTypes.${type}.name`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="qs-province">{t("home.quickSearch.province")}</Label>
        <Select name="provincia">
          <SelectTrigger id="qs-province" className="w-full">
            <SelectValue placeholder={t("home.quickSearch.anyProvince")} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="lg" className="mt-2">
        <SearchIcon />
        {t("home.quickSearch.submit")}
      </Button>
    </Form>
  );
}
