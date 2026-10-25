import { describe, expect, it } from "vitest";

import type { OpportunitySummary } from "../types";

import { buildNewOpportunityEmail } from "./announcement";

const URL = "https://inversorhouse.com/oportunidades/piso-en-malaga-abc123";

function summary(overrides: Partial<OpportunitySummary> = {}): OpportunitySummary {
  return {
    id: "1",
    slug: "piso-en-malaga-abc123",
    type: "CRV",
    title: "Piso en Málaga",
    excerpt: "",
    amountToRaise: 250_000,
    minTicket: null,
    termMonths: 8,
    returns: { kind: "fixed", nominalMin: 12, nominalMax: 12, annualMin: 18, annualMax: 18 },
    municipality: "Málaga",
    province: "Málaga",
    coverImageUrl: null,
    isFeatured: false,
    publishedAt: new Date("2026-10-20T10:00:00Z"),
    closesAt: null,
    ...overrides,
  };
}

// Intl uses narrow no-break spaces ("250.000 €"); compare on plain spaces.
const plain = (value: string) => value.replace(/[  ]/g, " ");

describe("buildNewOpportunityEmail", () => {
  it("builds the WhatsApp-ready block without optional lines", () => {
    const { subject, text } = buildNewOpportunityEmail(summary(), URL);

    expect(subject).toBe("Nuevo anuncio de oportunidad: Piso en Málaga");
    expect(plain(text)).toBe(
      [
        "🔥 ¡NUEVA OPORTUNIDAD DE INVERSIÓN!",
        "",
        "✅ Piso en Málaga",
        "🏷️ CRV — Compra, reforma y venta",
        "📍 Málaga, Málaga",
        "💰 Capital buscado: 250.000 €",
        "📈 Rentabilidad anual: 18 % (total: 12 %)",
        "⏳ Plazo: 8 meses",
        "",
        `🔗 Más info: ${URL}`,
      ].join("\n"),
    );
  });

  it("adds minimum ticket, closing date and return ranges when present", () => {
    const { text } = buildNewOpportunityEmail(
      summary({
        type: "COINVERSION",
        minTicket: 10_000,
        termMonths: 1,
        closesAt: new Date("2026-12-31T12:00:00Z"),
        returns: { kind: "range", nominalMin: 10, nominalMax: 14, annualMin: 15, annualMax: 21 },
      }),
      URL,
    );

    expect(plain(text)).toContain("🏷️ Coinversión\n");
    expect(plain(text)).toContain("🎟️ Ticket mínimo: 10.000 €");
    expect(plain(text)).toContain("📈 Rentabilidad anual: 15 – 21 % (total: 10 – 14 %)");
    expect(plain(text)).toContain("⏳ Plazo: 1 mes");
    expect(plain(text)).toContain("📅 Cierre: 31 de diciembre de 2026");
  });

  it("escapes promoter text in the HTML and keeps the <pre> block unindented", () => {
    const { html, text } = buildNewOpportunityEmail(summary({ title: "<b>Ático</b> & más" }), URL);

    expect(text).toContain("✅ <b>Ático</b> & más");
    expect(html).toContain("✅ &lt;b&gt;Ático&lt;/b&gt; &amp; más");
    expect(html).not.toContain("<b>");
    expect(html).toMatch(/<pre[^>]*>🔥/);
    expect(html).toContain("pegarlo directamente en WhatsApp");
  });
});
