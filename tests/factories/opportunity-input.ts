import type { OpportunityInput } from "../../src/features/opportunities/schemas";

export const paragraphDoc = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

/** A valid create/edit payload (Málaga, CRV). Override what each test cares about. */
export function buildOpportunityInput(patch: Partial<OpportunityInput> = {}): OpportunityInput {
  return {
    type: "CRV",
    title: "Piso para reformar en el centro de Málaga",
    description: paragraphDoc("Vivienda de 90 m² en el centro histórico. ".repeat(4)),
    amountToRaise: 250_000,
    minTicket: 10_000,
    termMonths: 18,
    closesOn: null,
    returnKind: "range",
    returnNominalMin: 15,
    returnNominalMax: 21,
    returnAnnualMin: 10,
    returnAnnualMax: 14,
    municipalityCode: "29067",
    images: [],
    documents: [],
    ...patch,
  };
}
