/** Regenerates the small binary fixtures used by e2e tests. `pnpm tsx tests/e2e/fixtures/make-fixtures.ts` */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

const dir = join(process.cwd(), "tests/e2e/fixtures");

async function main() {
  await sharp(join(process.cwd(), "public/brand/hero.webp"))
    .resize(800, 600)
    .jpeg({ quality: 70 })
    .toFile(join(dir, "photo.jpg"));

  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj
trailer<</Root 1 0 R>>
%%EOF
`;
  writeFileSync(join(dir, "nota-simple.pdf"), pdf);
  console.log("fixtures written");
}

void main();
