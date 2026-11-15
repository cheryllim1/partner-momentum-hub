import { describe, it, expect } from "vitest";
import { PARTNERS, computeKpis, incentivesFor } from "./partners";
describe("kpis", () => {
  it("match spec", () => {
    const k = computeKpis(PARTNERS);
    expect(k.activationRate.toFixed(1)).toBe("36.7");
    expect(k.avgDays).toBe(76);
    expect(k.atRisk).toBe(18);
    expect(k.untapped).toBe(158);
  });
  it("first deal unlocks 50% voucher only when rule 3 on", () => {
    expect(incentivesFor("Bronze", 10000, true)).toContain("50% Technical Certification Voucher");
    expect(incentivesFor("Bronze", 10000, false)).toEqual([]);
  });
});
describe("momentum merge", () => {
  it("all 30 partners have a contact, a partner manager and a directory id", async () => {
    const { DIRECTORY } = await import("./directory");
    expect(PARTNERS.length).toBe(30);
    for (const p of PARTNERS) {
      expect(p.contact?.email).toBeTruthy();
      expect(p.partnerManager).toBeTruthy();
      expect(DIRECTORY.some((d) => d.id === p.id)).toBe(true);
    }
  });
});
