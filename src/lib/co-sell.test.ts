import { describe, expect, it } from "vitest";
import { confirmCoSell, emptyCoSell, recordDemoPing } from "./co-sell";

describe("demo co-sell progress", () => {
  it("starts with no invented AE or confirmed milestones", () => {
    expect(emptyCoSell()).toEqual({ aeName: "", confirmations: {} });
  });
  it("confirms each milestone only when explicitly selected and allows reversal", () => {
    const start = emptyCoSell();
    const accepted = confirmCoSell(start, "aeAccepted", true, "2026-11-15T22:32:00Z");
    expect(accepted.confirmations).toEqual({ aeAccepted: "2026-11-15T22:32:00Z" });
    const intro = confirmCoSell(accepted, "introduced", true, "2026-11-16T10:00:00Z");
    const advanced = confirmCoSell(intro, "advanced", true, "2026-11-17T10:00:00Z");
    expect(Object.keys(advanced.confirmations)).toEqual(["aeAccepted", "introduced", "advanced"]);
    expect(confirmCoSell(advanced, "introduced", false, "").confirmations).toEqual({ aeAccepted: "2026-11-15T22:32:00Z", advanced: "2026-11-17T10:00:00Z" });
    expect(start.confirmations).toEqual({});
  });
  it("a simulated Slack ping never confirms any progress", () => {
    const pinged = recordDemoPing(emptyCoSell(), "2026-11-15T22:32:00Z");
    expect(pinged.lastPing).toBe("2026-11-15T22:32:00Z");
    expect(pinged.confirmations).toEqual({});
  });
});