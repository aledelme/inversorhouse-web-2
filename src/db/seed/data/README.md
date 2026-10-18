# Spanish geography seed data

Generated from the official INE dictionary "Relación de municipios y códigos por
comunidades autónomas y provincias" (1 January 2026, 8 132 municipalities).

- `communities.json`: `[code, name, slug]`
- `provinces.json`: `[code, name, slug, communityCode]`
- `municipalities.json`: `[code, name, slug, provinceCode]` (code = province + 3-digit INE code)

Regenerate (yearly, when INE publishes a new dictionary):

```sh
curl -o dic.xlsx https://www.ine.es/daco/daco42/codmun/diccionario26.xlsx
python -I scripts/geo/xlsx_dump.py dic.xlsx rows.json
pnpm tsx scripts/geo/build-geo.ts rows.json
pnpm db:seed   # upserts, safe to re-run
```

Do not edit these files by hand. Community/province display names live in
`scripts/geo/reference.ts`.
