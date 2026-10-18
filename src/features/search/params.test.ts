import { describe, expect, it } from "vitest";

import { countActiveFilters, loadSearchParams, serializeSearch, toFilters } from "./params";

describe("search params", () => {
  it("parses a full URL into filters", async () => {
    const state = await loadSearchParams(
      Promise.resolve({
        tipo: "CRV,NPL",
        ccaa: "13",
        provincia: "28",
        municipio: "28079",
        ticket: "25000",
        pagina: "2",
      }),
    );
    expect(toFilters(state)).toEqual({
      types: ["CRV", "NPL"],
      community: "13",
      province: "28",
      municipality: "28079",
      maxTicket: 25000,
      page: 2,
    });
    expect(countActiveFilters(state)).toBe(3);
  });

  it("ignores malformed values", async () => {
    const state = await loadSearchParams(
      Promise.resolve({ tipo: "FOO", provincia: "madrid", municipio: "1", pagina: "-3" }),
    );
    expect(toFilters(state)).toEqual({
      types: undefined,
      community: undefined,
      province: undefined,
      municipality: undefined,
      maxTicket: undefined,
      page: 1,
    });
  });

  it("serializes back to a shareable URL", () => {
    expect(serializeSearch("/oportunidades", { tipo: ["CRA"], provincia: "29", pagina: 1 })).toBe(
      "/oportunidades?tipo=CRA&provincia=29",
    );
  });
});
