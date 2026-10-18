import { describe, expect, it } from "vitest";

import { createReport } from "@/features/reports/server";

import { createOpportunityRow, createUser } from "../../../../tests/factories/db";

import { addInterest, hasInterest, listMyInterests, removeInterest } from "./service";

describe("interests (business rule #9)", () => {
  it("records one interest per user and opportunity", async () => {
    const promoter = await createUser();
    const investor = await createUser();
    const opportunity = await createOpportunityRow(promoter.id);

    await addInterest(investor.id, opportunity.id);
    await addInterest(investor.id, opportunity.id);
    expect(await hasInterest(investor.id, opportunity.id)).toBe(true);
    expect(await listMyInterests(investor.id)).toHaveLength(1);

    await removeInterest(investor.id, opportunity.id);
    expect(await hasInterest(investor.id, opportunity.id)).toBe(false);
  });

  it("rejects interest in your own or hidden opportunities", async () => {
    const promoter = await createUser();
    const own = await createOpportunityRow(promoter.id);
    await expect(addInterest(promoter.id, own.id)).rejects.toMatchObject({
      code: "ownOpportunity",
    });

    const investor = await createUser();
    const hidden = await createOpportunityRow(promoter.id, { status: "withdrawn" });
    await expect(addInterest(investor.id, hidden.id)).rejects.toMatchObject({ code: "notFound" });
  });
});

describe("reports (business rule #10)", () => {
  it("keeps a single report per user and opportunity", async () => {
    const promoter = await createUser();
    const reporter = await createUser();
    const opportunity = await createOpportunityRow(promoter.id);
    await createReport(reporter.id, { opportunityId: opportunity.id, reason: "fraud" });
    await createReport(reporter.id, {
      opportunityId: opportunity.id,
      reason: "duplicate",
      details: "Igual que otro",
    });

    const { listReports } = await import("@/features/reports/server");
    const open = await listReports("open");
    expect(open).toHaveLength(1);
    expect(open[0]).toMatchObject({ reason: "duplicate", details: "Igual que otro" });
  });
});
