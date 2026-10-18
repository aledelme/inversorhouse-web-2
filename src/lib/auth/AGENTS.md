# lib/auth

- `requireUser()` / `requireAdmin()` throw `AuthError` → use inside `runAction` (server actions).
- `requireUserPage()` / `requireAdminPage()` redirect / 404 → use in pages and layouts.
- `getViewer()` returns null when signed out; it upserts the local `users` row (no PII).
- Admin = verified Clerk email in `ADMIN_EMAILS` (ADR-0006). Never trust client-side checks.
- Only `clerk.ts` imports `@clerk/nextjs/server`; mock it in integration tests.
