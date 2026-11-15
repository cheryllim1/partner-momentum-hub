import { describe, expect, it } from "vitest";
import { partnerEvidence } from "./partner-insights";
describe("AI partner evidence", () => {
  it("does not infer customers from closed-won deals", () => {
    const cgi = partnerEvidence().find((p) => p.id === "OT-115");
    expect(cgi?.closedWonDeals).toBe(1);
    expect(cgi?.currentCustomers).toBeNull();
    expect(cgi?.openOpportunities).toBe(3);
  });
  it("keeps missing activity missing rather than treating partners as dormant", () => {
    const rows = partnerEvidence();
    expect(rows).toHaveLength(604);
    expect(rows.filter((p) => p.activity !== null)).toHaveLength(30);
    expect(rows.filter((p) => p.activity === null)).toHaveLength(574);
    expect(rows.filter((p) => p.openOpportunities === null)).toHaveLength(574);
  });
});