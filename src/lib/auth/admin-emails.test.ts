import { describe, expect, it } from "vitest";

import { hasAdminEmail, parseAdminEmails } from "./admin-emails";

describe("admin emails", () => {
  it("parses a comma separated, case-insensitive list", () => {
    expect(parseAdminEmails(" Ana@Example.com, ,bob@example.com ")).toEqual(
      new Set(["ana@example.com", "bob@example.com"]),
    );
    expect(parseAdminEmails(undefined).size).toBe(0);
  });

  it("matches verified emails only by value", () => {
    const admins = parseAdminEmails("ana@example.com");
    expect(hasAdminEmail(["ANA@example.com"], admins)).toBe(true);
    expect(hasAdminEmail(["other@example.com"], admins)).toBe(false);
    expect(hasAdminEmail([], admins)).toBe(false);
  });
});
