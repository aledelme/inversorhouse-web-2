/**
 * `pnpm dev`: safe local development.
 * 1. Loads .env.development(.local) and refuses remote DB/storage.
 * 2. Starts Docker services and applies pending migrations.
 * 3. Starts `next dev` on the first free port from 3020 (override: PORT=xxxx).
 */
import { assertLocalServices, loadEnv } from "./lib/env";
import { findFreePort, run, servicesUp } from "./lib/run";

async function main() {
  loadEnv("development");
  assertLocalServices("pnpm dev");
  if (process.env.SKIP_SERVICES !== "1") {
    await servicesUp();
    await run("pnpm", ["tsx", "scripts/db-migrate.ts"]);
  }
  const port = await findFreePort(Number(process.env.PORT ?? 3020));
  await run("pnpm", ["next", "dev", "-p", String(port), ...process.argv.slice(2)]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
