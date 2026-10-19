# 0011. Delete detached files on edit and sweep orphaned uploads daily with Vercel Cron

- Status: proposed
- Date: 2026-10-19

## Context

ADR-0005 uploads files straight to R2 with presigned URLs and left one consequence open: objects
that end up unreferenced are never deleted. Two sources:

- **Detached files.** Editing an opportunity replaces its image/document rows, but the objects stay.
  A removed private document keeps existing in R2 indefinitely: a cost and a privacy (GDPR)
  problem, since the promoter believes it is gone.
- **Abandoned uploads.** A user uploads a file and never saves the form, or removes it before saving.

Keys are `u/<users.id>/<uuid>.<ext>` and a user may attach the same key to several of their
listings, so "not in this opportunity any more" does not mean "unused".

## Decision

- **On edit** (`updateOpportunity`), after the transaction commits, the keys dropped from that
  opportunity are passed to `deleteDetachedFiles` (`src/features/uploads/server/service.ts`), which
  deletes only those **no row still references**. It is best-effort: errors are logged, never fail
  the edit.
- **Daily sweep**: `sweepOrphanUploads` lists every object under `u/` in both buckets and deletes
  the ones that no `opportunity_images` / `opportunity_documents` row references and that are older
  than a **48-hour grace period** (covers a form left open after uploading; presigned PUTs expire
  in 5 minutes). Seed data (`seed/`) is never touched.
- The sweep runs from **Vercel Cron** (`vercel.json` → `crons`, daily at 04:00 UTC) calling
  `GET /api/cron/storage-cleanup`. The route requires `Authorization: Bearer $CRON_SECRET`
  (Vercel sends it automatically when the `CRON_SECRET` env var is set) and answers 401 when the
  variable is missing, so it fails closed.
- Deletion uses single `DeleteObject` calls in batches of 20 (no `DeleteObjects`/checksum
  compatibility concerns between R2 and MinIO).

## Consequences

- Removed documents disappear from storage as soon as the edit is saved.
- Storage only holds referenced files plus, at most, two days of abandoned uploads.
- The sweep loads all referenced keys in memory and lists the whole `u/` prefix: fine for tens of
  thousands of files. Revisit (track uploads in a table, or paginate by user prefix) if it grows
  beyond that or the function approaches its time limit.
- An upload attached more than 48 hours after it was made would point to a deleted object. The
  edit form re-uploads on every session, so this needs a form left open for two days.
- Cron jobs only run on production deployments. Locally the route can be called by hand with the
  `CRON_SECRET` from `.env.development.local`.

## Alternatives considered

- **R2 lifecycle rules** — they expire by age/prefix only and cannot tell referenced from orphaned
  objects.
- **An `uploads` table tracking pending/attached files** — exact and cheaper at scale, but adds a
  schema, writes on every upload and more moving parts than the current volume needs.
- **Deleting inside the request with `after()`** — keeps the edit faster but makes the service
  depend on the Next runtime; the delete is a few milliseconds and the sweep is the safety net.
