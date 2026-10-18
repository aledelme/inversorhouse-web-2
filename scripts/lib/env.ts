import { loadEnvConfig } from "@next/env";

/** Loads .env files exactly like Next.js does for the given mode. */
export function loadEnv(mode: "development" | "production" | "test") {
  // @next/env picks .env.{mode}[.local] based on NODE_ENV and the `dev` flag.
  Object.assign(process.env, { NODE_ENV: mode });
  loadEnvConfig(
    process.cwd(),
    mode === "development",
    { info: () => {}, error: console.error },
    true,
  );
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "host.docker.internal"]);

export function isLocalUrl(value: string | undefined): boolean {
  if (!value) return true;
  try {
    return LOCAL_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

/**
 * Refuses to continue when a local command is about to touch remote infrastructure.
 * Opt out (consciously) with ALLOW_REMOTE=1.
 */
export function assertLocalServices(context: string, { allowOverride = true } = {}) {
  const offenders = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["R2_ENDPOINT", process.env.R2_ENDPOINT ?? "(unset → Cloudflare R2)"],
  ].filter(([, value]) => !isLocalUrl(value));

  if (offenders.length === 0) return;
  if (allowOverride && process.env.ALLOW_REMOTE === "1") {
    console.warn(
      `⚠️  ${context}: ALLOW_REMOTE=1 — using remote services: ${offenders.map(([k]) => k).join(", ")}`,
    );
    return;
  }
  console.error(
    `\n✋ ${context} refused: these variables point to remote services:\n` +
      offenders.map(([k]) => `   - ${k}`).join("\n") +
      `\n\nLocal commands must use the Docker services (see .env.example).` +
      (allowOverride
        ? `\nIf you really mean it, re-run with ALLOW_REMOTE=1.\n`
        : `\nThis command never runs against remote services.\n`),
  );
  process.exit(1);
}
