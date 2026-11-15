import { describe, it, expect } from "vitest";
import { DIRECTORY, filterPartners, incentivesWithOverrides } from "./directory";
describe("directory", () => {
  it("loads all 604 uploaded partners", () => expect(DIRECTORY.length).toBe(604));
  it("filters by tier", () => expect(filterPartners(DIRECTORY, { q: "", tier: "Platinum", region: "", type: "" }).length).toBe(75));
  it("filters by type", () => expect(filterPartners(DIRECTORY, { q: "", tier: "", region: "", type: "Reseller" }).length).toBe(173));
  it("overrides change voucher and SE threshold", () => {
    const o = { voucherPct: 100, seThreshold: 80000, spiffPct: 0, enabled: true };
    expect(incentivesWithOverrides(o, 50000)).toEqual(["100% Technical Certification Voucher", "Pooled SE Office Hours"]);
    expect(incentivesWithOverrides(o, 90000)).toContain("Assigned Solutions Engineer for Deal Support");
    expect(incentivesWithOverrides({ ...o, enabled: false }, 90000)).toEqual([]);
  });
});
