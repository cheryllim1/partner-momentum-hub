import { describe, it, expect } from "vitest";
import { PARTNERS, computeKpis, incentivesFor, partnerTiming } from "./partners";
describe("kpis", () => {
  it("match spec", () => {
    const k = computeKpis(PARTNERS);
    expect(k.activationRate.toFixed(1)).toBe("40.0");
    expect(k.openOpportunities).toBe(139);
    expect(k.atRisk).toBe(11);
    expect(k.untapped).toBe(188);
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
describe("named partner managers", () => {
  it("no partner is left on Automated Ops", () => expect(PARTNERS.filter((p) => p.partnerManager === "Automated Ops")).toEqual([]));
});
describe("uploaded partner rules", () => {
  it("shows signing duration only for Bronze", () => {
    expect(partnerTiming({ tier: "Bronze", daysSinceSigned: 43, daysSinceLastDeal: null })).toBe("43d since signed");
    expect(partnerTiming({ tier: "Silver", daysSinceSigned: 43, daysSinceLastDeal: 16 })).toBe("16d since last deal");
    expect(partnerTiming({ tier: "Gold", daysSinceSigned: 43, daysSinceLastDeal: null })).toBeNull();
  });
  it("strips email apostrophes without changing other characters", () => {
    expect(PARTNERS.find((p) => p.id === "OT-115")?.contact.email).toBe("claire.oconnor@cg.com");
  });
  it("uses the uploaded CGI figures across pipeline and profile", async () => {
    const { DIRECTORY } = await import("./directory");
    for (const records of [PARTNERS, DIRECTORY]) {
      const cgi = records.find((p) => p.id === "OT-115");
      expect(cgi?.opportunities).toBe(4);
      expect(cgi?.avgDealSize).toBe(280000);
      expect(cgi?.implementationsDone).toBe(2);
    }
  });
});
