import { defaultLocale, localeTags, timeZone, type Locale } from "@/i18n/config";

/**
 * Locale-aware formatting (ADR-0010). Components call these instead of
 * toLocaleString so a second locale only needs a new entry in i18n/config.
 */
const tag = (locale: Locale) => localeTags[locale];

/** 250000 → "250.000 €" */
export function formatEuros(value: number, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(tag(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** 1250000 → "1,3 M €"; 85000 → "85 mil €" */
export function formatEurosCompact(value: number, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(tag(locale), {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** 12.5 → "12,5 %" (value is already a percentage, not a ratio). */
export function formatPercent(value: number, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(tag(locale), {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/** Fixed or range return: "12 %" or "10 – 14 %". */
export function formatPercentRange(min: number, max: number, locale: Locale = defaultLocale) {
  if (min === max) return formatPercent(min, locale);
  const n = new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 2 });
  return `${n.format(min)} – ${formatPercent(max, locale)}`;
}

/** "18 de octubre de 2026" */
export function formatDate(date: Date, locale: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(tag(locale), { dateStyle: "long", timeZone }).format(date);
}

/** "18 oct 2026" */
export function formatDateShort(date: Date, locale: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(tag(locale), { dateStyle: "medium", timeZone }).format(date);
}
