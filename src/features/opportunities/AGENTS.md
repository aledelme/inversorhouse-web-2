# opportunities — the core listing

Read `docs/domain.md` (business rules #1–#11) before changing anything here.

- **Visibility** is one SQL predicate: `isVisible()` in `server/queries.ts` (published, not closed,
  promoter active). Every public read must use it (it needs `users` joined). Never re-implement it.
- **Ordering**: featured first, then `published_at desc` (`searchOpportunities`).
- **Public reads** (`queries.ts`) are `'use cache'` + `cacheLife("minutes")` + tags from `tags.ts`.
  They never include promoter PII — only `promoterUserId` (internal, never rendered).
- **Mutations**: `server/actions.ts` (auth + `updateTag`) → `server/service.ts` (rules, ownership,
  upload-key checks, sanitising). Services take an explicit `Actor`; `isAdmin` comes from
  `@/lib/auth`, never from the client.
- `schemas.ts` (`opportunityInputSchema`) is shared by the form and the action. Messages are keys
  under `errors.*`. Fixed returns force max = min; annual return defaults to nominal × 12 / term.
- Descriptions are Tiptap JSON validated against `richTextExtensions` (`sanitizeRichText`), never HTML.
- Status: `published ⇄ withdrawn` by the owner; `removed` only by admins (owner can't edit/republish).
- Tests: `schemas.test.ts` (unit), `server/*.int.test.ts` (real Postgres; `tests/factories`).
