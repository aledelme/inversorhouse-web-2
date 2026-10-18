import { describe, expect, it } from "vitest";

import { formatEuros, formatPercent, formatPercentRange } from "./format";

// Intl uses narrow no-break spaces; normalise them for readable assertions.
const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

describe("format", () => {
  it("formats euros without decimals", () => {
    expect(plain(formatEuros(250000))).toBe("250.000 €");
  });

  it("formats percentages given as percent values", () => {
    expect(plain(formatPercent(12.5))).toBe("12,5 %");
  });

  it("formats fixed and ranged returns", () => {
    expect(plain(formatPercentRange(12, 12))).toBe("12 %");
    expect(plain(formatPercentRange(10, 14.5))).toBe("10 – 14,5 %");
  });
});
