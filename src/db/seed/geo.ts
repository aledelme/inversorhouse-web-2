import { sql } from "drizzle-orm";

import type { Db } from "../create";
import { autonomousCommunities, municipalities, provinces } from "../schema";

import communitiesJson from "./data/communities.json";
import municipalitiesJson from "./data/municipalities.json";
import provincesJson from "./data/provinces.json";

// JSON tuples (see data/README.md).
const communitiesData = communitiesJson as [code: string, name: string, slug: string][];
const provincesData = provincesJson as [
  code: string,
  name: string,
  slug: string,
  community: string,
][];
const municipalitiesData = municipalitiesJson as [
  code: string,
  name: string,
  slug: string,
  province: string,
][];

const BATCH = 1000;

/** Upserts the INE geography. Idempotent. */
export async function seedGeo(db: Db) {
  await db
    .insert(autonomousCommunities)
    .values(communitiesData.map(([code, name, slug]) => ({ code, name, slug })))
    .onConflictDoUpdate({
      target: autonomousCommunities.code,
      set: { name: sql`excluded.name`, slug: sql`excluded.slug` },
    });

  await db
    .insert(provinces)
    .values(
      provincesData.map(([code, name, slug, communityCode]) => ({
        code,
        name,
        slug,
        communityCode,
      })),
    )
    .onConflictDoUpdate({
      target: provinces.code,
      set: {
        name: sql`excluded.name`,
        slug: sql`excluded.slug`,
        communityCode: sql`excluded.community_code`,
      },
    });

  for (let i = 0; i < municipalitiesData.length; i += BATCH) {
    await db
      .insert(municipalities)
      .values(
        municipalitiesData
          .slice(i, i + BATCH)
          .map(([code, name, slug, provinceCode]) => ({ code, name, slug, provinceCode })),
      )
      .onConflictDoUpdate({
        target: municipalities.code,
        set: {
          name: sql`excluded.name`,
          slug: sql`excluded.slug`,
          provinceCode: sql`excluded.province_code`,
        },
      });
  }

  return {
    communities: communitiesData.length,
    provinces: provincesData.length,
    municipalities: municipalitiesData.length,
  };
}
