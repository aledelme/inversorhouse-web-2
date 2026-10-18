/**
 * Brand facts (ADR-0009). UI copy lives in messages/*.json; this file holds
 * values that are not translated (names, URLs, asset paths, colours for meta tags).
 */
export const brand = {
  name: "InversorHouse",
  legalName: "Inversor House",
  domain: "inversorhouse.com",
  email: "atencion@inversorhouse.com",
  themeColor: "#0f3460",
  logo: {
    mark: "/brand/isotipo.png",
    markOnDark: "/brand/isotipo-white.png",
    wordmark: "/brand/wordmark.png",
    wordmarkOnDark: "/brand/wordmark-white.png",
    /** Intrinsic sizes of the files above (for next/image). */
    markSize: { width: 481, height: 377 },
    wordmarkSize: { width: 1093, height: 94 },
  },
  heroImage: "/brand/hero.webp",
  /** Legal owner shown in the legal notice and privacy policy (LSSI art. 10). */
  legalOwner: {
    name: "Andrés Iván Del Medico Bravo",
    taxId: "42242231V",
    address: "Plaza de España s/n, CP 36920, Marín (Pontevedra)",
    jurisdiction: "Madrid",
  },
  legalUpdatedAt: "2026-10-18",
  social: {
    instagram: "https://www.instagram.com/inversorhouse",
    linkedin: "https://www.linkedin.com/company/inversor-house",
  },
} as const;
