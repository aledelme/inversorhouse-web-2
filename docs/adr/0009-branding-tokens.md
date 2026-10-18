# 0009. Branding through config and semantic tokens

- Status: accepted
- Date: 2026-10-18

## Context

The brand (navy #0f3460, gold #d4a574, Playfair Display + Inter) comes from v1 and may change.

## Decision

- Brand facts (name, tagline, contact, socials, logo paths) in `src/config/brand.ts`.
- Colours, radii and shadows as **semantic CSS variables** in `src/styles/theme.css` (`--primary`,
  `--accent`, `--surface`…), exposed to Tailwind via `@theme inline`. Components use semantic
  classes (`bg-primary`, `text-muted-foreground`), never hex values.
- Fonts in `src/config/fonts.ts` (`--font-display`, `--font-sans`).
- Logos in `public/brand/`.

## Consequences

A rebrand means editing `brand.ts`, `theme.css` and `fonts.ts` and replacing `public/brand/*`. Dark
mode can be added by defining the same tokens under a `.dark` selector.
