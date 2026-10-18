import { describe, expect, it } from "vitest";

import { sanitizeRichText } from "./sanitize";

const doc = (content: unknown[]) => ({ type: "doc", content });

describe("sanitizeRichText", () => {
  it("keeps valid content and extracts text", () => {
    const result = sanitizeRichText(
      doc([
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Resumen" }] },
        { type: "paragraph", content: [{ type: "text", text: "Piso de 3 habitaciones." }] },
      ]),
    );
    expect(result.text).toBe("Resumen\nPiso de 3 habitaciones.");
  });

  it("removes javascript: links but keeps the text", () => {
    const result = sanitizeRichText(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "clic",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ]),
    );
    expect(JSON.stringify(result.doc)).not.toContain("javascript");
    expect(result.text).toBe("clic");
  });

  it("rejects unknown node types", () => {
    expect(() => sanitizeRichText(doc([{ type: "iframe" }]))).toThrow();
  });
});
