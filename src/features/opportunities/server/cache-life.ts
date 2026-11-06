import type { OpportunitySummary } from "../types";

/** Longest time the home listings stay cached between regenerations (ADR-0014). */
export const HOME_LISTING_MAX_REVALIDATE = 60 * 60;
const MIN_REVALIDATE = 60;
const STALE = 5 * 60;
const EXPIRE = 7 * 24 * 60 * 60;

/**
 * Inline `cacheLife` profile for the home listings (ADR-0014): revalidate after an hour, or as
 * soon as one of the listed opportunities closes (visibility is evaluated in SQL with `now()`).
 * Mutations still invalidate instantly through `updateTag`.
 */
export function homeListingCacheLife(
  items: readonly Pick<OpportunitySummary, "closesAt">[],
  now: number = Date.now(),
) {
  const nextClose = Math.min(
    ...items.map((item) => item.closesAt?.getTime() ?? Infinity).filter((time) => time > now),
  );
  const untilClose = Math.ceil((nextClose - now) / 1000);
  const revalidate = Math.max(MIN_REVALIDATE, Math.min(HOME_LISTING_MAX_REVALIDATE, untilClose));
  return { stale: STALE, revalidate, expire: EXPIRE };
}
