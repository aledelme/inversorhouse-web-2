import { timingSafeEqual } from "node:crypto";

import { sweepOrphanUploads } from "@/features/uploads/server";
import { env } from "@/lib/env";

/** Uploads younger than this are never swept: the user may still be filling the form. */
const GRACE_PERIOD_MS = 48 * 60 * 60 * 1000;

function isAuthorized(request: Request) {
  if (!env.CRON_SECRET) return false;
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/**
 * Daily sweep of orphaned uploads (ADR-0011), called by Vercel Cron (`vercel.json`).
 * Fails closed: without CRON_SECRET configured every call is rejected.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) return new Response(null, { status: 401 });
  const deleted = await sweepOrphanUploads({ olderThan: new Date(Date.now() - GRACE_PERIOD_MS) });
  return Response.json({ deleted }, { headers: { "Cache-Control": "no-store" } });
}
