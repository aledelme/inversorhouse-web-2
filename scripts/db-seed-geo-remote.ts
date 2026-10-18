/**
 * Loads ONLY the INE geography (communities, provinces, municipalities) into the database in
 * DATABASE_URL — including remote ones (Neon). Idempotent upsert of public reference data; it
 * never writes users or opportunities. Asks for confirmation unless `--yes` is passed.
 *
 *   DATABASE_URL="postgres://…neon…" pnpm tsx scripts/db-seed-geo-remote.ts
 */
import { createInterface } from "node:readline/promises";

import { createDb } from "../src/db/create";
import { seedGeo } from "../src/db/seed/geo";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL explicitly for this command");
  const host = new URL(url).hostname;

  if (!process.argv.includes("--yes")) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `Load INE geography into ${host}? Type "${host}" to confirm: `,
    );
    rl.close();
    if (answer.trim() !== host) {
      console.log("Cancelled.");
      return;
    }
  }

  const { db, pool } = createDb(url, { max: 1 });
  try {
    console.log("✔ geography", await seedGeo(db));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
