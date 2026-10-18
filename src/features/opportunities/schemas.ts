import { z } from "zod";

import { docToText } from "@/components/rich-text/text";

import { OPPORTUNITY_TYPES, RETURN_KINDS } from "./constants";

/**
 * Input of the create/edit form, shared by the client (live validation) and the
 * server action (authoritative). Messages are keys under `errors.*`.
 */
const euros = z.number({ error: "required" }).int("integer").positive("positive");
const percent = z.number({ error: "required" }).min(0, "positive").max(1000, "percentTooHigh");

export const MIN_DESCRIPTION_CHARS = 80;

export const imageInputSchema = z.object({
  key: z.string().min(1),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export const documentInputSchema = z.object({
  key: z.string().min(1),
  fileName: z.string().trim().min(1).max(200),
  size: z.number().int().positive(),
  contentType: z.string().min(1),
});

export const opportunityInputSchema = z
  .object({
    type: z.enum(OPPORTUNITY_TYPES, { error: "required" }),
    title: z.string().trim().min(10, "titleTooShort").max(120, "titleTooLong"),
    description: z
      .record(z.string(), z.unknown())
      .refine((doc) => docToText(doc).length >= MIN_DESCRIPTION_CHARS, "descriptionTooShort"),
    amountToRaise: euros.max(2_000_000_000, "amountTooLarge"),
    minTicket: euros.nullable(),
    termMonths: z
      .number({ error: "required" })
      .int("integer")
      .min(1, "positive")
      .max(360, "termTooLong"),
    /** Calendar date (YYYY-MM-DD). The listing disappears at the end of that day (Madrid). */
    closesOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "invalid")
      .nullable(),
    returnKind: z.enum(RETURN_KINDS),
    returnNominalMin: percent,
    returnNominalMax: percent,
    returnAnnualMin: percent,
    returnAnnualMax: percent,
    municipalityCode: z.string().regex(/^\d{5}$/, "municipalityRequired"),
    images: z.array(imageInputSchema).max(12, "tooManyFiles"),
    documents: z.array(documentInputSchema).max(10, "tooManyFiles"),
  })
  .transform((input) =>
    input.returnKind === "fixed"
      ? {
          ...input,
          returnNominalMax: input.returnNominalMin,
          returnAnnualMax: input.returnAnnualMin,
        }
      : input,
  )
  .superRefine((input, ctx) => {
    if (input.minTicket !== null && input.minTicket > input.amountToRaise) {
      ctx.addIssue({ code: "custom", path: ["minTicket"], message: "minTicketTooHigh" });
    }
    if (input.returnNominalMin > input.returnNominalMax) {
      ctx.addIssue({ code: "custom", path: ["returnNominalMax"], message: "rangeInverted" });
    }
    if (input.returnAnnualMin > input.returnAnnualMax) {
      ctx.addIssue({ code: "custom", path: ["returnAnnualMax"], message: "rangeInverted" });
    }
  });

export type OpportunityInput = z.input<typeof opportunityInputSchema>;
export type OpportunityData = z.output<typeof opportunityInputSchema>;

/** "2026-12-31" → the instant that day ends in Madrid (approximated to 23:00 UTC). */
export function closesOnToDate(closesOn: string | null): Date | null {
  return closesOn ? new Date(`${closesOn}T23:00:00Z`) : null;
}

/** Inverse of closesOnToDate, for the edit form. */
export function dateToClosesOn(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}
