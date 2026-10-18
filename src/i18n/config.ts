/** Supported UI locales (ADR-0010). Add "en" here + messages/en.json to start translating. */
export const locales = ["es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

/** BCP 47 tags used for Intl formatting and <html lang>. */
export const localeTags: Record<Locale, string> = { es: "es-ES" };

export const timeZone = "Europe/Madrid";
