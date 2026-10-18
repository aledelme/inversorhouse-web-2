import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db/client";
import { autonomousCommunities, municipalities, provinces } from "@/db/schema";

import { sortByName } from "../sort";
import type { CommunityOption, LocationNames, MunicipalityOption, ProvinceOption } from "../types";

// Geography is static INE data: cache forever (ADR-0007).

export async function getCommunities(): Promise<CommunityOption[]> {
  "use cache";
  cacheLife("max");
  cacheTag("geo");
  const rows = await db
    .select({ code: autonomousCommunities.code, name: autonomousCommunities.name })
    .from(autonomousCommunities);
  return sortByName(rows);
}

export async function getProvinces(): Promise<ProvinceOption[]> {
  "use cache";
  cacheLife("max");
  cacheTag("geo");
  const rows = await db
    .select({ code: provinces.code, name: provinces.name, communityCode: provinces.communityCode })
    .from(provinces);
  return sortByName(rows);
}

export async function getMunicipalities(provinceCode: string): Promise<MunicipalityOption[]> {
  "use cache";
  cacheLife("max");
  cacheTag("geo");
  const rows = await db
    .select({ code: municipalities.code, name: municipalities.name })
    .from(municipalities)
    .where(eq(municipalities.provinceCode, provinceCode));
  return sortByName(rows);
}

export async function getLocation(municipalityCode: string): Promise<LocationNames | null> {
  "use cache";
  cacheLife("max");
  cacheTag("geo");
  const [row] = await db
    .select({
      municipalityCode: municipalities.code,
      municipality: municipalities.name,
      provinceCode: provinces.code,
      province: provinces.name,
      communityCode: autonomousCommunities.code,
      community: autonomousCommunities.name,
    })
    .from(municipalities)
    .innerJoin(provinces, eq(provinces.code, municipalities.provinceCode))
    .innerJoin(autonomousCommunities, eq(autonomousCommunities.code, provinces.communityCode))
    .where(eq(municipalities.code, municipalityCode));
  return row ?? null;
}
