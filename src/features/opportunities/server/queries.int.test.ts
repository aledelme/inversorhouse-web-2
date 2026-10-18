import { describe, expect, it } from "vitest";

import { createOpportunityRow, createUser } from "../../../../tests/factories/db";

import { getPublicOpportunity, isOpportunityVisible, searchOpportunities } from "./queries";

const DAY = 86_400_000;

describe("visibility (business rule #1)", () => {
  it("lists only published, open listings of active promoters", async () => {
    const active = await createUser();
    const banned = await createUser({ status: "banned" });
    const visible = await createOpportunityRow(active.id);
    await createOpportunityRow(active.id, { status: "withdrawn" });
    await createOpportunityRow(active.id, { status: "removed" });
    await createOpportunityRow(active.id, { closesAt: new Date(Date.now() - DAY) });
    const openEnded = await createOpportunityRow(active.id, {
      closesAt: new Date(Date.now() + DAY),
    });
    await createOpportunityRow(banned.id);

    const page = await searchOpportunities({});
    expect(page.items.map((o) => o.id).sort()).toEqual([visible.id, openEnded.id].sort());
    expect(page.total).toBe(2);
  });

  it("hides the public detail and documents of hidden listings", async () => {
    const promoter = await createUser();
    const withdrawn = await createOpportunityRow(promoter.id, { status: "withdrawn" });
    expect(await getPublicOpportunity(withdrawn.slug)).toBeNull();
    expect(await isOpportunityVisible(withdrawn.id)).toBe(false);
  });
});

describe("ordering (business rule #2)", () => {
  it("puts featured first, then the most recent", async () => {
    const promoter = await createUser();
    const old = await createOpportunityRow(promoter.id, {
      publishedAt: new Date(Date.now() - 3 * DAY),
    });
    const recent = await createOpportunityRow(promoter.id, { publishedAt: new Date() });
    const featuredOld = await createOpportunityRow(promoter.id, {
      isFeatured: true,
      publishedAt: new Date(Date.now() - 10 * DAY),
    });
    const { items } = await searchOpportunities({});
    expect(items.map((o) => o.id)).toEqual([featuredOld.id, recent.id, old.id]);
  });
});

describe("filters", () => {
  it("filters by type, location and investor budget", async () => {
    const promoter = await createUser();
    const npl = await createOpportunityRow(promoter.id, { type: "NPL", minTicket: 50_000 });
    const madrid = await createOpportunityRow(promoter.id, {
      municipalityCode: "28079",
      provinceCode: "28",
      communityCode: "13",
      minTicket: null,
    });
    const cheap = await createOpportunityRow(promoter.id, { minTicket: 5_000 });

    expect((await searchOpportunities({ types: ["NPL"] })).items.map((o) => o.id)).toEqual([
      npl.id,
    ]);
    expect((await searchOpportunities({ province: "28" })).items.map((o) => o.id)).toEqual([
      madrid.id,
    ]);
    expect((await searchOpportunities({ community: "01" })).total).toBe(2);

    // Budget 10.000 €: no minimum or minimum ≤ 10.000.
    const budget = await searchOpportunities({ maxTicket: 10_000 });
    expect(budget.items.map((o) => o.id).sort()).toEqual([madrid.id, cheap.id].sort());
  });

  it("paginates", async () => {
    const promoter = await createUser();
    for (let i = 0; i < 14; i++) await createOpportunityRow(promoter.id);
    const second = await searchOpportunities({ page: 2 });
    expect(second.total).toBe(14);
    expect(second.pageCount).toBe(2);
    expect(second.items).toHaveLength(2);
  });
});
