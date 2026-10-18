import { describe, expect, it } from "vitest";

import { isOwnUploadKey, uploadRequestSchema } from "./rules";

describe("upload rules", () => {
  it("accepts allowed types within size", () => {
    expect(
      uploadRequestSchema.safeParse({ kind: "image", contentType: "image/webp", size: 1000 })
        .success,
    ).toBe(true);
    expect(
      uploadRequestSchema.safeParse({
        kind: "document",
        contentType: "application/pdf",
        size: 1000,
      }).success,
    ).toBe(true);
  });

  it("rejects disallowed types and oversized files", () => {
    const svg = uploadRequestSchema.safeParse({
      kind: "image",
      contentType: "image/svg+xml",
      size: 10,
    });
    expect(svg.error?.issues[0]?.message).toBe("fileType");
    const huge = uploadRequestSchema.safeParse({
      kind: "image",
      contentType: "image/png",
      size: 50 * 1024 * 1024,
    });
    expect(huge.error?.issues[0]?.message).toBe("fileTooLarge");
  });

  it("only accepts keys under the user's prefix", () => {
    expect(isOwnUploadKey("u/abc/1.webp", "abc")).toBe(true);
    expect(isOwnUploadKey("u/other/1.webp", "abc")).toBe(false);
    expect(isOwnUploadKey("u/abc/../other/1.webp", "abc")).toBe(false);
  });
});
