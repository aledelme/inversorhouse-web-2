# 0009. Branding through config and semantic tokens

- Status: accepted
- Date: 2026-10-18

## Context

The brand (navy #0f3460, gold #d4a574, Playfair Display + Inter) comes from v1 and may change.

## Decision

- Brand facts (name, tagline, contact, socials, logo paths) in `src/config/brand.ts`.
- Colours, radii and shadows as **semantic CSS variables** in `src/styles/theme.css`, exposed to
  Tailwind via `@theme inline` in `globals.css`. Components use semantic classes (`bg-primary`,
  `text-muted-foreground`, `bg-inverse`), never hex values.
  - shadcn/ui contract: `--primary` (navy), `--accent` (= subtle hover surface, as shadcn uses it), …
  - Brand extras: `--highlight` (gold, decorative), `--highlight-strong` (gold for text on light
    backgrounds, AA contrast), `--inverse` (deep navy sections: hero, footer).
- Fonts in `src/config/fonts.ts` (next/font vars `--font-playfair`, `--font-inter`, mapped to Tailwind `font-display` / `font-sans`).
- Logos in `public/brand/`.

## Consequences

A rebrand means editing `brand.ts`, `theme.css` and `fonts.ts` and replacing `public/brand/*`. Dark
mode can be added by defining the same tokens under a `.dark` selector.
