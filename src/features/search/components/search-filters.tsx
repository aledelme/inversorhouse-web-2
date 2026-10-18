"use client";

import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CommunityOption, LocationFields, type ProvinceOption } from "@/features/geo";
import { OPPORTUNITY_TYPES, type OpportunityType, TICKET_OPTIONS } from "@/features/opportunities";
import { formatEuros } from "@/lib/format";
import { cn } from "@/lib/utils";

import { searchParsers } from "../params";

const ANY = "any";

export function SearchFilters({
  communities,
  provinces,
  className,
}: {
  communities: CommunityOption[];
  provinces: ProvinceOption[];
  className?: string;
}) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useQueryStates(searchParsers, {
    shallow: false,
    scroll: false,
    startTransition,
  });

  // Any filter change goes back to page 1.
  const update = (patch: Partial<typeof state>) => setState({ ...patch, pagina: null });

  const toggleType = (type: OpportunityType) =>
    update({
      tipo: state.tipo.includes(type)
        ? state.tipo.filter((t) => t !== type)
        : [...state.tipo, type],
    });

  return (
    <div
      className={cn("space-y-8 transition-opacity", isPending && "opacity-60", className)}
      aria-busy={isPending}
    >
      <fieldset className="space-y-3">
        <legend className="mb-3 eyebrow">{t("search.type")}</legend>
        <div className="flex flex-wrap gap-2">
          {OPPORTUNITY_TYPES.map((type) => {
            const active = state.tipo.includes(type);
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                onClick={() => toggleType(type)}
                title={t(`opportunityTypes.${type}.name`)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:border-primary/40",
                )}
              >
                {t(`opportunityTypes.${type}.label`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 eyebrow">{t("search.location")}</legend>
        <LocationFields
          communities={communities}
          provinces={provinces}
          value={{
            community: state.ccaa ?? undefined,
            province: state.provincia ?? undefined,
            municipality: state.municipio ?? undefined,
          }}
          onChange={(location) =>
            update({
              ccaa: location.community ?? null,
              provincia: location.province ?? null,
              municipio: location.municipality ?? null,
            })
          }
        />
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-3 eyebrow">{t("search.ticket")}</legend>
        <Label htmlFor="filter-ticket" className="sr-only">
          {t("search.ticket")}
        </Label>
        <Select
          value={state.ticket ? String(state.ticket) : ANY}
          onValueChange={(value) => update({ ticket: value === ANY ? null : Number(value) })}
        >
          <SelectTrigger id="filter-ticket" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t("search.anyTicket")}</SelectItem>
            {TICKET_OPTIONS.map((amount) => (
              <SelectItem key={amount} value={String(amount)}>
                {t("search.upTo", { amount: formatEuros(amount) })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t("search.ticketHint")}</p>
      </fieldset>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() =>
          setState({
            tipo: null,
            ccaa: null,
            provincia: null,
            municipio: null,
            ticket: null,
            pagina: null,
          })
        }
      >
        {t("search.clearFilters")}
      </Button>
    </div>
  );
}
