import { describe, expect, it } from "vitest";

import { HOME_LISTING_MAX_REVALIDATE, homeListingCacheLife } from "./cache-life";

const NOW = new Date("2026-11-06T12:00:00Z").getTime();
const at = (secondsFromNow: number) => ({ closesAt: new Date(NOW + secondsFromNow * 1000) });
const open = { closesAt: null };

describe("homeListingCacheLife", () => {
  it("revalidates hourly when nothing listed closes sooner", () => {
    expect(homeListingCacheLife([], NOW).revalidate).toBe(HOME_LISTING_MAX_REVALIDATE);
    expect(homeListingCacheLife([open, at(5 * 3600)], NOW).revalidate).toBe(
      HOME_LISTING_MAX_REVALIDATE,
    );
  });

  it("revalidates when the earliest listed opportunity closes", () => {
    expect(homeListingCacheLife([open, at(1800), at(900)], NOW).revalidate).toBe(900);
  });

  it("never revalidates faster than once a minute", () => {
    expect(homeListingCacheLife([at(5)], NOW).revalidate).toBe(60);
  });

  it("ignores closing dates already in the past", () => {
    expect(homeListingCacheLife([at(-60)], NOW).revalidate).toBe(HOME_LISTING_MAX_REVALIDATE);
  });

  it("keeps the entry in the static shell (stale ≥ 30s, expire ≥ 5 min)", () => {
    const life = homeListingCacheLife([at(5)], NOW);
    expect(life.stale).toBeGreaterThanOrEqual(30);
    expect(life.expire).toBeGreaterThanOrEqual(300);
  });
});
