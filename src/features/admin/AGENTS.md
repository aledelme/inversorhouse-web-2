# admin — moderation panel (ADR-0006)

- Users: non-technical. Every destructive action has a confirmation dialog, plain Spanish copy and,
  for removals/bans, a mandatory reason (shown to the promoter for removals).
- Every action: `requireAdmin()` → service → `logAdminAction(...)` → `updateTag(...)`.
  No admin mutation without an audit entry.
- Admins may edit any opportunity through the normal edit page (`/panel/oportunidades/[id]/editar`).
- Banning = local `users.status = banned` (hides listings via the visibility query) + Clerk
  `banUser` (revokes sessions). An admin cannot ban themselves.
- Admin pages read personal data (names/emails) from Clerk at request time; never cache them.
- Non-admins get a 404 (not 403) for `/admin/**`, so the panel's existence is not revealed.
