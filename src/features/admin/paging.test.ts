import { describe, expect, it } from "vitest";

import { ADMIN_PAGE_SIZE, pageInfo, parsePage } from "./paging";

describe("parsePage", () => {
  it("accepts positive integers", () => {
    expect(parsePage("3")).toBe(3);
  });

  it.each([undefined, "", "0", "-2", "1.5", "abc", ["2"]])("falls back to 1 for %j", (value) => {
    expect(parsePage(value)).toBe(1);
  });
});

describe("pageInfo", () => {
  it("computes the offset and the page count", () => {
    expect(pageInfo(2, ADMIN_PAGE_SIZE * 2 + 1)).toEqual({
      page: 2,
      pageCount: 3,
      offset: ADMIN_PAGE_SIZE,
    });
  });

  it("always reports at least one page", () => {
    expect(pageInfo(1, 0).pageCount).toBe(1);
  });
});
