"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { CommunityOption, MunicipalityOption, ProvinceOption } from "../types";

export type LocationValue = {
  community?: string;
  province?: string;
  municipality?: string;
};

const ALL = "all";
const municipalityCache = new Map<string, Promise<MunicipalityOption[]>>();

function loadMunicipalities(province: string) {
  let pending = municipalityCache.get(province);
  if (!pending) {
    pending = fetch(`/api/geo/provinces/${province}/municipalities`).then((r) =>
      r.ok ? (r.json() as Promise<MunicipalityOption[]>) : [],
    );
    municipalityCache.set(province, pending);
  }
  return pending;
}

type Props = {
  communities: CommunityOption[];
  provinces: ProvinceOption[];
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  /** Form mode: every level is required and "all" options are hidden. */
  required?: boolean;
  /** When set, renders a hidden input with the municipality code (for <form> posts). */
  municipalityInputName?: string;
  invalid?: boolean;
  className?: string;
};

/** Cascading CCAA → provincia → municipio picker (controlled). */
export function LocationFields({
  communities,
  provinces,
  value,
  onChange,
  required = false,
  municipalityInputName,
  invalid,
  className,
}: Props) {
  const t = useTranslations("geo");
  const id = useId();
  // Municipalities of the last loaded province; derived below so a stale list is never shown.
  const [loaded, setLoaded] = useState<{ province: string; list: MunicipalityOption[] } | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  const visibleProvinces = useMemo(
    () =>
      value.community ? provinces.filter((p) => p.communityCode === value.community) : provinces,
    [provinces, value.community],
  );

  useEffect(() => {
    const province = value.province;
    if (!province) return;
    let active = true;
    loadMunicipalities(province).then((list) => {
      if (active) setLoaded({ province, list });
    });
    return () => {
      active = false;
    };
  }, [value.province]);

  const municipalities = value.province && loaded?.province === value.province ? loaded.list : [];

  const selectedMunicipality = municipalities.find((m) => m.code === value.municipality);

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-community`}>{t("community")}</Label>
        <Select
          value={value.community ?? (required ? "" : ALL)}
          onValueChange={(community) =>
            onChange({ community: community === ALL ? undefined : community })
          }
        >
          <SelectTrigger id={`${id}-community`} className="w-full" aria-invalid={invalid}>
            <SelectValue placeholder={t("chooseCommunity")} />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value={ALL}>{t("allCommunities")}</SelectItem>}
            {communities.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-province`}>{t("province")}</Label>
        <Select
          value={value.province ?? (required ? "" : ALL)}
          onValueChange={(province) => {
            if (province === ALL) return onChange({ community: value.community });
            const community = provinces.find((p) => p.code === province)?.communityCode;
            onChange({ community, province });
          }}
        >
          <SelectTrigger id={`${id}-province`} className="w-full" aria-invalid={invalid}>
            <SelectValue placeholder={t("chooseProvince")} />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value={ALL}>{t("allProvinces")}</SelectItem>}
            {visibleProvinces.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-municipality`}>{t("municipality")}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${id}-municipality`}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-invalid={invalid}
              disabled={!value.province}
              className="w-full justify-between font-normal"
            >
              <span className={cn("truncate", !selectedMunicipality && "text-muted-foreground")}>
                {selectedMunicipality?.name ??
                  (value.province
                    ? required
                      ? t("chooseMunicipality")
                      : t("allMunicipalities")
                    : t("chooseProvinceFirst"))}
              </span>
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
            <Command>
              <CommandInput placeholder={t("searchMunicipality")} />
              <CommandList>
                <CommandEmpty>{t("noMunicipality")}</CommandEmpty>
                <CommandGroup>
                  {!required && (
                    <CommandItem
                      value={t("allMunicipalities")}
                      onSelect={() => {
                        onChange({ community: value.community, province: value.province });
                        setOpen(false);
                      }}
                    >
                      {t("allMunicipalities")}
                    </CommandItem>
                  )}
                  {municipalities.map((m) => (
                    <CommandItem
                      key={m.code}
                      value={m.name}
                      onSelect={() => {
                        onChange({ ...value, municipality: m.code });
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(value.municipality === m.code ? "opacity-100" : "opacity-0")}
                      />
                      {m.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {municipalityInputName && (
          <input type="hidden" name={municipalityInputName} value={value.municipality ?? ""} />
        )}
      </div>
    </div>
  );
}
