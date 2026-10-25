import { describe, expect, it } from "vitest";

import { parseEmailList } from "./email-list";

describe("parseEmailList", () => {
  it("trims, lower-cases, drops blanks and duplicates", () => {
    expect(parseEmailList(" Ana@Example.com, ,bob@example.com,ana@example.com ")).toEqual([
      "ana@example.com",
      "bob@example.com",
    ]);
  });

  it("returns an empty list for missing input", () => {
    expect(parseEmailList(undefined)).toEqual([]);
    expect(parseEmailList("")).toEqual([]);
  });
});
