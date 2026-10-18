import { OPPORTUNITY_TYPES, RETURN_KINDS } from "@/db/enum-values";

export { OPPORTUNITY_TYPES, RETURN_KINDS };
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
export type ReturnKind = (typeof RETURN_KINDS)[number];

export const PAGE_SIZE = 12;

/** Budget options offered in the search filter (whole euros). */
export const TICKET_OPTIONS = [5_000, 10_000, 25_000, 50_000, 100_000, 250_000] as const;

export function isOpportunityType(value: string): value is OpportunityType {
  return (OPPORTUNITY_TYPES as readonly string[]).includes(value);
}
