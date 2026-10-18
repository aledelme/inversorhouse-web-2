# marketing — home page sections

- Presentational sections for `/` (hero, quick search, operation types, how it works, CTA).
- Copy lives in `messages/es.json` → `home.*`. Never claim numbers we can't back with data
  (no fake stats/testimonials).
- Data-backed sections (`FeaturedSection`, `LatestSection`) are exported from `server/index.ts`
  and use cached opportunity queries, so the home stays in the static shell.
