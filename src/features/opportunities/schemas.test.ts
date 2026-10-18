import { describe, expect, it } from "vitest";

import {
  buildOpportunityInput,
  paragraphDoc as paragraph,
} from "../../../tests/factories/opportunity-input";

import { annualFromNominal } from "./returns";
import { closesOnToDate, dateToClosesOn, opportunityInputSchema } from "./schemas";

const validInput = buildOpportunityInput();

describe("opportunityInputSchema", () => {
  it("accepts a valid opportunity", () => {
    expect(opportunityInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("forces max = min for fixed returns", () => {
    const data = opportunityInputSchema.parse({
      ...validInput,
      returnKind: "fixed",
      returnNominalMax: 99,
      returnAnnualMax: 99,
    });
    expect(data.returnNominalMax).toBe(15);
    expect(data.returnAnnualMax).toBe(10);
  });

  it.each([
    [{ minTicket: 300_000 }, "minTicket", "minTicketTooHigh"],
    [{ returnNominalMin: 30 }, "returnNominalMax", "rangeInverted"],
    [{ title: "Corto" }, "title", "titleTooShort"],
    [{ description: paragraph("Muy breve") }, "description", "descriptionTooShort"],
    [{ municipalityCode: "" }, "municipalityCode", "municipalityRequired"],
  ])("rejects %o", (patch, path, message) => {
    const result = opportunityInputSchema.safeParse({ ...validInput, ...patch });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(expect.objectContaining({ path: [path], message }));
  });
});

describe("returns and dates", () => {
  it("annualises the nominal return linearly", () => {
    expect(annualFromNominal(18, 18)).toBe(12);
    expect(annualFromNominal(10, 6)).toBe(20);
    expect(annualFromNominal(10, 0)).toBe(0);
  });

  it("round-trips the closing date", () => {
    const date = closesOnToDate("2026-12-31");
    expect(date?.toISOString()).toBe("2026-12-31T23:00:00.000Z");
    expect(dateToClosesOn(date!)).toBe("2026-12-31");
    expect(closesOnToDate(null)).toBeNull();
  });
});
