/**
 * `pnpm prod:local`: production build served locally, for debugging.
 * Uses .env.production(.local) — which must point at the Docker services —
 * then runs `next build` and `next start` on the first free port from 3021.
 */
import { assertLocalServices, loadEnv } from "./lib/env";
import { findFreePort, run, servicesUp } from "./lib/run";

async function main() {
  loadEnv("production");
  assertLocalServices("pnpm prod:local");
  await servicesUp();
  await run("pnpm", ["tsx", "scripts/db-migrate.ts"]);
  if (process.env.SKIP_BUILD !== "1") await run("pnpm", ["next", "build"]);
  const port = await findFreePort(Number(process.env.PORT ?? 3021));
  await run("pnpm", ["next", "start", "-p", String(port)]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
