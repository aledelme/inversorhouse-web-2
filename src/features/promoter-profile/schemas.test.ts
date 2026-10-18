import { describe, expect, it } from "vitest";

import { contactSettingsSchema, isAllowedBookingUrl, parseStoredContact } from "./schemas";

describe("contactSettingsSchema", () => {
  it("normalises Spanish phones to E.164", () => {
    const result = contactSettingsSchema.parse({
      phone: "612 34 56 78",
      phoneVisibility: "public",
    });
    expect(result).toEqual({
      phone: "+34612345678",
      phoneVisibility: "public",
      bookingUrl: undefined,
    });
  });

  it("accepts international numbers", () => {
    const result = contactSettingsSchema.parse({
      phone: "+33 6 12 34 56 78",
      phoneVisibility: "public",
    });
    expect(result.phone).toBe("+33612345678");
  });

  it("rejects invalid phones", () => {
    const result = contactSettingsSchema.safeParse({ phone: "123", phoneVisibility: "public" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("phoneInvalid");
  });

  it("requires a booking link when the phone is hidden", () => {
    const result = contactSettingsSchema.safeParse({
      phone: "612345678",
      phoneVisibility: "hidden",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ["bookingUrl"],
      message: "bookingUrlRequired",
    });
  });

  it("only allows Google Calendar booking links", () => {
    expect(isAllowedBookingUrl("https://calendar.app.google/AbC123")).toBe(true);
    expect(
      isAllowedBookingUrl("https://calendar.google.com/calendar/appointments/schedules/x"),
    ).toBe(true);
    expect(isAllowedBookingUrl("http://calendar.app.google/AbC123")).toBe(false);
    expect(isAllowedBookingUrl("https://evil.example.com/calendar.app.google")).toBe(false);
    expect(isAllowedBookingUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("parseStoredContact", () => {
  it("accepts the null bookingUrl written on save", () => {
    expect(
      parseStoredContact({ phone: "+34612345678", phoneVisibility: "public", bookingUrl: null }),
    ).toEqual({ phone: "+34612345678", phoneVisibility: "public", bookingUrl: undefined });
  });

  it("returns null for missing or corrupt data", () => {
    expect(parseStoredContact(undefined)).toBeNull();
    expect(parseStoredContact(null)).toBeNull();
    expect(parseStoredContact({ phone: "x", phoneVisibility: "public" })).toBeNull();
  });
});
