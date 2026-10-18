# search — public opportunity search (/oportunidades)

- The URL is the state. Contract in `params.ts` (`searchParsers`), shared by the server loader
  (`loadSearchParams`) and the client filters (nuqs `useQueryStates`, `shallow: false`).
  Changing a key breaks shared links — add, don't rename.
- Any filter change resets `pagina`.
- `toFilters` sanitises the URL (malformed codes are ignored, never 500).
- Results come from `searchOpportunities` (cached, tag `opportunities`); ordering is fixed by
  business rule #2 (featured first, then newest). The "ticket" filter means "my budget":
  opportunities with `min_ticket ≤ ticket` or no minimum.
- `SearchResults` reads `searchParams` → must be rendered inside `<Suspense>`.
