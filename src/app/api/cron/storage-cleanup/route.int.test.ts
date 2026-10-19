import { afterEach, describe, expect, it, vi } from "vitest";

const SECRET = "test-cron-secret-0123456789";

/** `env` is parsed when the module loads, so each case imports the route afresh. */
async function loadRoute(cronSecret: string | undefined) {
  vi.resetModules();
  vi.stubEnv("CRON_SECRET", cronSecret);
  return import("./route");
}

const call = (route: Awaited<ReturnType<typeof loadRoute>>, authorization?: string) =>
  route.GET(
    new Request("http://localhost/api/cron/storage-cleanup", {
      headers: authorization ? { authorization } : {},
    }),
  );

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/cron/storage-cleanup", () => {
  it("rejects calls without the right bearer token", async () => {
    const route = await loadRoute(SECRET);
    expect((await call(route)).status).toBe(401);
    expect((await call(route, "Bearer wrong")).status).toBe(401);
    expect((await call(route, SECRET)).status).toBe(401);
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    const route = await loadRoute(undefined);
    expect((await call(route, "Bearer undefined")).status).toBe(401);
    expect((await call(route, "Bearer ")).status).toBe(401);
  });

  it("runs the sweep for Vercel Cron", async () => {
    const route = await loadRoute(SECRET);
    const response = await call(route, `Bearer ${SECRET}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      deleted: { image: expect.any(Number), document: expect.any(Number) },
    });
  });
});
