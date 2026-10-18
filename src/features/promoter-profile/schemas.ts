import { isValidPhoneNumber, parsePhoneNumberWithError } from "libphonenumber-js";
import { z } from "zod";

export const PHONE_VISIBILITIES = ["public", "hidden"] as const;
export type PhoneVisibility = (typeof PHONE_VISIBILITIES)[number];

/** Google Calendar appointment-schedule hosts accepted as booking links. */
export const BOOKING_HOSTS = ["calendar.app.google", "calendar.google.com"] as const;

export function isAllowedBookingUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (BOOKING_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Promoter contact settings, stored in Clerk privateMetadata.contact (ADR-0003).
 * Error messages are keys under `errors.*` in messages/es.json.
 */
export const contactSettingsSchema = z
  .object({
    phone: z
      .string()
      .trim()
      .refine((value) => isValidPhoneNumber(value, "ES"), "phoneInvalid")
      .transform((value) => parsePhoneNumberWithError(value, "ES").number),
    phoneVisibility: z.enum(PHONE_VISIBILITIES),
    bookingUrl: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined))
      .refine((value) => value === undefined || isAllowedBookingUrl(value), "bookingUrlInvalid"),
  })
  .superRefine((value, ctx) => {
    if (value.phoneVisibility === "hidden" && !value.bookingUrl) {
      ctx.addIssue({ code: "custom", path: ["bookingUrl"], message: "bookingUrlRequired" });
    }
  });

export type ContactSettingsInput = z.input<typeof contactSettingsSchema>;

/**
 * Reads what is stored in Clerk. Saving writes `bookingUrl: null` to delete the key on
 * Clerk's deep merge, so null must be accepted here. Returns null for missing/invalid data.
 */
export function parseStoredContact(raw: unknown): ContactSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const { bookingUrl, ...rest } = raw as Record<string, unknown>;
  const parsed = contactSettingsSchema.safeParse({ ...rest, bookingUrl: bookingUrl ?? undefined });
  return parsed.success ? parsed.data : null;
}
export type ContactSettings = z.output<typeof contactSettingsSchema>;

/** What a signed-in visitor may see about a promoter. */
export type PromoterContact = {
  name: string;
  email: string | null;
  /** Only present when the promoter chose to show it. */
  phone: string | null;
  bookingUrl: string | null;
};
