import { describe, it, expect } from "vitest";
import { PARTNERS, computeKpis, incentivesFor, partnerTiming, activityAge, activityState } from "./partners";
describe("kpis", () => {
  it("match spec", () => {
    const k = computeKpis(PARTNERS);
    expect(k.activationRate.toFixed(1)).toBe("40.0");
    expect(k.openOpportunities).toBe(139);
    expect(k.dormant).toBe(0);
    expect(k.atRisk).toBe(0);
    expect(k.untapped).toBe(0);
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
  it("uses the explicit latest activity age rather than last-deal age", () => {
    expect(activityAge("Portal login 14 days ago")).toBe(14);
    expect(activityAge("Deal registered 7d ago")).toBe(7);
    expect(activityAge("No activity date supplied")).toBeNull();
  });
  it("classifies 30 through 89 days as disengaged even with won deals", () => {
    expect(activityState(29, 1, false)).toBe("Activated (1st Deal Reg)");
    expect(activityState(30, 1, false)).toBe("Disengaged");
    expect(activityState(89, 1, false)).toBe("Disengaged");
  });
  it("classifies 90 days or more as dormant regardless of deal count", () => {
    expect(activityState(90, 1, false)).toBe("Dormant (90d+)");
    expect(activityState(120, 0, false)).toBe("Dormant (90d+)");
    const base = PARTNERS[0];
    if (!base) throw new Error("Missing partner");
    expect(computeKpis([{ ...base, daysSinceLastActivity: 89 }, { ...base, daysSinceLastActivity: 90 }]).dormant).toBe(1);
  });
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
