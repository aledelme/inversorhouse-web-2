/** Seeds the LOCAL database (geography + sample data). Never runs against remote hosts. */
import { createDb } from "../src/db/create";
import { seedGeo } from "../src/db/seed/geo";
import { seedSampleData } from "../src/db/seed/sample";

import { assertLocalServices, loadEnv } from "./lib/env";

async function main() {
  loadEnv(process.env.NODE_ENV === "production" ? "production" : "development");
  assertLocalServices("db:seed", { allowOverride: false });

  const { db, pool } = createDb(process.env.DATABASE_URL!, { max: 1 });
  try {
    console.log("✔ geography", await seedGeo(db));
    if (process.argv.includes("--geo-only")) return;
    console.log("✔ sample data", await seedSampleData(db));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
