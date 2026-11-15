import { describe, expect, it } from "vitest";
import { DEALS, matchesFor } from "./deals";
import { PARTNERS } from "./partners";

describe("deal recommendations", () => {
  it("never recommends more than five partners", () => {
    const deal = DEALS[0];
    if (!deal) throw new Error("Missing deal");
    const candidates = PARTNERS.map((p) => ({ ...p, dealsRegistered: 0, region: deal.region }));
    expect(matchesFor(deal, candidates)).toHaveLength(5);
  });
});