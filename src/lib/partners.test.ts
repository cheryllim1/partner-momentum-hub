import { describe, it, expect } from "vitest";
import { PARTNERS, computeKpis, incentivesFor } from "./partners";
describe("kpis", () => {
  it("match spec", () => {
    const k = computeKpis(PARTNERS);
    expect(k.activationRate.toFixed(1)).toBe("33.3");
    expect(k.avgDays).toBe(50);
    expect(k.atRisk).toBe(3);
    expect(k.untapped).toBe(25);
  });
  it("first deal unlocks 50% voucher only when rule 3 on", () => {
    expect(incentivesFor("Bronze", 10000, true)).toContain("50% Technical Certification Voucher");
    expect(incentivesFor("Bronze", 10000, false)).toEqual([]);
  });
});
