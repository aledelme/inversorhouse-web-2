# geo — Spanish administrative geography

- Read-only INE data (communities → provinces → municipalities). Never mutated by the app; see
  `src/db/seed/data/README.md` to refresh it.
- Queries are cached forever (`cacheLife("max")`, tag `geo`). Sort with `sortByName` (Spanish
  collation), not SQL `ORDER BY` (DB collation may be "C").
- Client components load municipalities lazily from `GET /api/geo/provinces/[code]/municipalities`
  (all 52 provinces and 19 communities are passed as props).
- `LocationFields` is the cascading CCAA → provincia → municipio picker used by search filters and
  the opportunity form. It is controlled (value/onChange) and renders no <form>.
