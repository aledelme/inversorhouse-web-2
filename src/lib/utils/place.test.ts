import { describe, expect, it } from "vitest";

import { formatPlace } from "./place";

describe("formatPlace", () => {
  it("avoids repeating the province when it equals the municipality", () => {
    expect(formatPlace("Málaga", "Málaga")).toBe("Málaga");
    expect(formatPlace("Marbella", "Málaga")).toBe("Marbella, Málaga");
  });
});
