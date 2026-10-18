/**
 * Builds src/db/seed/data/{communities,provinces,municipalities}.json
 * from the INE municipality dictionary.
 *
 *   1. Download https://www.ine.es/daco/daco42/codmun/diccionarioYY.xlsx
 *   2. python -I scripts/geo/xlsx_dump.py diccionarioYY.xlsx rows.json
 *   3. pnpm tsx scripts/geo/build-geo.ts rows.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "../../src/lib/utils/slugify";

import { COMMUNITIES, PROVINCES } from "./reference";

const ARTICLES = /^(.*), (A|O|As|Os|El|La|Los|Las|Els|Es|Sa|Ses|Les|Lo|L')$/;

/** INE writes "Coruña, A" → we display "A Coruña" (also per bilingual part). */
export function displayName(ineName: string): string {
  return ineName
    .split("/")
    .map((part) => {
      const m = part.trim().match(ARTICLES);
      if (!m) return part.trim();
      return m[2] === "L'" ? `L'${m[1]}` : `${m[2]} ${m[1]}`;
    })
    .join("/");
}

function main(rowsPath: string) {
  const rows = JSON.parse(readFileSync(rowsPath, "utf8")) as string[][];
  const header = rows.findIndex((r) => r[0] === "CODAUTO");
  if (header < 0) throw new Error("CODAUTO header not found");

  const municipalities: [code: string, name: string, slug: string, province: string][] = [];
  const slugsPerProvince = new Map<string, Set<string>>();

  for (const [codauto, cpro, cmun, , nombre] of rows.slice(header + 1)) {
    if (!cpro || !cmun || !nombre) continue;
    const province = PROVINCES[cpro];
    if (!province) throw new Error(`Unknown province ${cpro}`);
    if (province[1] !== codauto) {
      throw new Error(`Province ${cpro} maps to ${province[1]} but INE says ${codauto}`);
    }
    const name = displayName(nombre);
    const seen = slugsPerProvince.get(cpro) ?? new Set();
    let slug = slugify(name);
    if (seen.has(slug)) slug = `${slug}-${cmun}`;
    seen.add(slug);
    slugsPerProvince.set(cpro, seen);
    municipalities.push([`${cpro}${cmun}`, name, slug, cpro]);
  }
  municipalities.sort((a, b) => a[0].localeCompare(b[0]));

  const outDir = join(process.cwd(), "src/db/seed/data");
  const communities = Object.entries(COMMUNITIES).map(([code, name]) => [
    code,
    name,
    slugify(name),
  ]);
  const provinces = Object.entries(PROVINCES).map(([code, [name, community]]) => [
    code,
    name,
    slugify(name),
    community,
  ]);
  writeFileSync(join(outDir, "communities.json"), JSON.stringify(communities) + "\n");
  writeFileSync(join(outDir, "provinces.json"), JSON.stringify(provinces) + "\n");
  writeFileSync(join(outDir, "municipalities.json"), JSON.stringify(municipalities) + "\n");
  console.log(
    `communities=${communities.length} provinces=${provinces.length} municipalities=${municipalities.length}`,
  );
}

if (process.argv[2]) main(process.argv[2]);
