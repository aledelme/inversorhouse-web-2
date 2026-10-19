import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db/client";
import { adminAuditLog } from "@/db/schema";
import { clerkClient } from "@/lib/auth/clerk";

import { createOpportunityRow, createUser } from "../../../../tests/factories/db";
import { ADMIN_PAGE_SIZE } from "../paging";

import { adminListOpportunities, adminListUsers, listAuditLog } from "./service";

/** Fake Clerk directory: `query` searches names/emails, `userId` resolves identities. */
const directory = new Map<string, { firstName: string; email: string }>();

beforeEach(() => {
  directory.clear();
  const getUserList = vi.fn(async (params: { query?: string; userId?: string[] }) => {
    const entries = [...directory].filter(([id, person]) =>
      params.query
        ? `${person.firstName} ${person.email}`.toLowerCase().includes(params.query.toLowerCase())
        : params.userId?.includes(id),
    );
    return {
      data: entries.map(([id, person]) => ({
        id,
        firstName: person.firstName,
        lastName: null,
        username: null,
        primaryEmailAddress: { emailAddress: person.email },
      })),
    };
  });
  vi.mocked(clerkClient).mockResolvedValue({ users: { getUserList } } as never);
});

async function createPerson(firstName: string, email: string) {
  const user = await createUser();
  directory.set(user.clerkUserId, { firstName, email });
  return user;
}

describe("adminListOpportunities", () => {
  it("paginates every listing instead of truncating", async () => {
    const promoter = await createPerson("Pablo", "pablo@example.com");
    for (let i = 0; i < ADMIN_PAGE_SIZE + 1; i++) await createOpportunityRow(promoter.id);

    const first = await adminListOpportunities({});
    const second = await adminListOpportunities({ page: 2 });

    expect(first).toMatchObject({ total: ADMIN_PAGE_SIZE + 1, page: 1, pageCount: 2 });
    expect(first.items).toHaveLength(ADMIN_PAGE_SIZE);
    expect(second.items).toHaveLength(1);
    expect(first.items.map((o) => o.id)).not.toContain(second.items[0]!.id);
    expect(second.items[0]!.promoter).toEqual({ name: "Pablo", email: "pablo@example.com" });
  });

  it("treats LIKE wildcards in the search as plain text", async () => {
    const promoter = await createUser();
    await createOpportunityRow(promoter.id, { title: "Rentabilidad del 100% garantizada" });
    await createOpportunityRow(promoter.id, { title: "Local comercial en Valencia" });

    const result = await adminListOpportunities({ q: "100%" });

    expect(result.total).toBe(1);
    expect(result.items[0]!.title).toContain("100%");
    expect((await adminListOpportunities({ q: "_" })).total).toBe(0);
  });
});

describe("adminListUsers", () => {
  it("finds users by name or email through Clerk", async () => {
    const ana = await createPerson("Ana", "ana@example.com");
    await createPerson("Luis", "luis@example.com");

    const byName = await adminListUsers({ q: "ana" });
    const byEmail = await adminListUsers({ q: "luis@" });

    expect(byName.items.map((u) => u.id)).toEqual([ana.id]);
    expect(byName.items[0]).toMatchObject({ name: "Ana", email: "ana@example.com" });
    expect(byEmail.items.map((u) => u.name)).toEqual(["Luis"]);
  });

  it("also matches the Clerk id (local seed users have no Clerk account)", async () => {
    const seed = await createUser({ clerkUserId: "seed_promoter" });
    await createPerson("Ana", "ana@example.com");

    const result = await adminListUsers({ q: "seed_" });

    expect(result.items.map((u) => u.id)).toEqual([seed.id]);
  });

  it("returns an empty page when nobody matches", async () => {
    await createPerson("Ana", "ana@example.com");
    expect(await adminListUsers({ q: "nadie" })).toMatchObject({ items: [], total: 0 });
  });

  it("paginates", async () => {
    for (let i = 0; i < ADMIN_PAGE_SIZE + 2; i++) await createUser();
    const second = await adminListUsers({ page: 2 });
    expect(second).toMatchObject({ total: ADMIN_PAGE_SIZE + 2, page: 2, pageCount: 2 });
    expect(second.items).toHaveLength(2);
  });
});

describe("listAuditLog", () => {
  it("paginates the whole history", async () => {
    const admin = await createPerson("Admin", "admin@example.com");
    const opportunity = await createOpportunityRow((await createUser()).id);
    await db.insert(adminAuditLog).values(
      Array.from({ length: ADMIN_PAGE_SIZE + 5 }, () => ({
        actorId: admin.id,
        action: "opportunity.feature",
        targetType: "opportunity",
        targetId: opportunity.id,
      })),
    );

    const second = await listAuditLog({ page: 2 });

    expect(second).toMatchObject({ total: ADMIN_PAGE_SIZE + 5, pageCount: 2 });
    expect(second.items).toHaveLength(5);
    expect(second.items[0]!.actor).toBe("Admin");
  });
});
