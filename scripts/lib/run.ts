import { spawn } from "node:child_process";
import { createServer } from "node:net";

/** Runs a command inheriting stdio; rejects on non-zero exit. */
export function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env,
      shell: process.platform === "win32",
    });
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(" ")} exited with ${code}`)),
    );
  });
}

function isPortFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer()
      .once("error", () => resolve(false))
      .once("listening", () => server.close(() => resolve(true)))
      .listen(port, "0.0.0.0");
  });
}

/** First free port starting at `start` (inclusive). */
export async function findFreePort(start: number, attempts = 20) {
  for (let port = start; port < start + attempts; port++) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found in ${start}-${start + attempts - 1}`);
}

const COMPOSE = ["compose", "-f", "docker/compose.yml"];

/** Starts Postgres + MinIO and (idempotently) creates the buckets. */
export async function servicesUp(services = ["postgres", "minio"]) {
  await run("docker", [...COMPOSE, "up", "-d", "--wait", ...services]);
  await run("docker", [...COMPOSE, "run", "--rm", "minio-init"]);
}
