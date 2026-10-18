import { z } from "zod";

import { REPORT_REASONS } from "@/db/enum-values";

export { REPORT_REASONS };
export type ReportReason = (typeof REPORT_REASONS)[number];

export const reportInputSchema = z.object({
  opportunityId: z.uuid(),
  reason: z.enum(REPORT_REASONS, { error: "required" }),
  details: z
    .string()
    .trim()
    .max(1000, "tooLong")
    .optional()
    .transform((v) => v || undefined),
});

export type ReportInput = z.input<typeof reportInputSchema>;
