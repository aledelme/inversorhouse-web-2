# src/app — routes only

- Pages and layouts are **thin**: read params, call feature queries, compose feature components.
  No SQL, no Clerk calls, no business rules here — put them in `src/features/<f>/server`.
- `params` and `searchParams` are Promises: `const { slug } = await params`. Use the generated
  global types `PageProps<"/oportunidades/[slug]">` / `LayoutProps<"/">` (`pnpm typecheck` runs `next typegen`).
- Cache Components is on. Anything that reads the session, cookies or headers must be inside a
  `<Suspense>` boundary (or the segment sets `export const instant = false`). Public data comes from
  cached queries so pages prerender a static shell.
- **Pages that read the session or uncached data** (panel/admin) render their content inside their
  own `<Suspense fallback={<PageSkeleton />}>` (see `src/app/panel/oportunidades/page.tsx`). Do not rely
  on `loading.tsx`: it doesn't cover navigations between pages that share a segment (e.g.
  `/panel/oportunidades/nueva` → `/panel/oportunidades`), which then block. Guarded by
  `tests/e2e/flows/instant-navigation.spec.ts` (`instant()` from `@next/playwright`) — add new
  panel/admin routes there.
- No `export const runtime`, `dynamic`, `revalidate` — they are invalid with Cache Components.
- Route groups: `(public)` marketing + marketplace, `(auth)` Clerk sign-in/up, `panel` signed-in
  user area, `admin` admin panel, `api` route handlers.
- Every page exports `generateMetadata` or `metadata` with Spanish copy from `messages/es.json`.
- Images: `next/image` with `preload` (not `priority`) for the LCP image.
- Docs: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/`.
