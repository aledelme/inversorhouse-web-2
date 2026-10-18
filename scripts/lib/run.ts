import { spawn } from "node:child_process";
import { connect } from "node:net";

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

/** True if something accepts connections on host:port. */
function isListening(port: number, host: string) {
  return new Promise<boolean>((resolve) => {
    const socket = connect({ port, host })
      .once("connect", () => {
        socket.destroy();
        resolve(true);
      })
      .once("error", () => resolve(false));
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Probing with listen() is unreliable on Windows (binding 0.0.0.0 can succeed while another
 * process listens on the same port), so check whether anything answers on IPv4 or IPv6.
 */
async function isPortFree(port: number) {
  const [v4, v6] = await Promise.all([isListening(port, "127.0.0.1"), isListening(port, "::1")]);
  return !v4 && !v6;
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
