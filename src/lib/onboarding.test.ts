import { describe, expect, it } from "vitest";
import { bronzePriority, onboardingPace, ONBOARDING_PHASES, resourceLinkValid, toggleCompletion } from "./onboarding";

describe("onboarding", () => {
  it("uses 30, 60 and 90-day milestone deadlines", () => {
    expect(ONBOARDING_PHASES.map((phase) => phase.due)).toEqual([30, 60, 90]);
    expect(onboardingPace(30, [], 0)).toBe("On Track");
    expect(onboardingPace(31, [], 0)).toBe("At Risk of Stalling");
    expect(onboardingPace(90, [], 0)).toBe("Needs Immediate Outreach");
  });
  it("does not guess missing signing ages", () => expect(onboardingPace(null, [], 0)).toBe("Signing age unknown"));
  it("requires confirmed milestones rather than assuming deal registration completes onboarding", () => {
    expect(onboardingPace(91, [], 1)).toBe("Needs Immediate Outreach");
    expect(onboardingPace(91, ONBOARDING_PHASES.flatMap((p) => p.items.map((i) => i.id)).filter((id) => id !== "deal"), 1)).toBe("Complete");
  });
  it("filters Bronze first 90 days and sorts overdue partners first", () => {
    const rows = bronzePriority([
      { id: "new", tier: "Bronze", daysSinceSigned: 5, dealsRegistered: 0 },
      { id: "old", tier: "Bronze", daysSinceSigned: 91, dealsRegistered: 0 },
      { id: "gold", tier: "Gold", daysSinceSigned: 32, dealsRegistered: 0 },
      { id: "late", tier: "Bronze", daysSinceSigned: 32, dealsRegistered: 0 },
    ], {});
    expect(rows.map((p) => p.id)).toEqual(["late", "new"]);
  });
  it("completion is reversible and independent of outreach", () => {
    expect(toggleCompletion([], "kit")).toEqual(["kit"]);
    expect(toggleCompletion(["kit"], "kit")).toEqual([]);
  });
  it("allows only supplied secure resource links", () => {
    expect(resourceLinkValid("")).toBe(true);
    expect(resourceLinkValid("https://example.org/course")).toBe(true);
    expect(resourceLinkValid("javascript:alert(1)")).toBe(false);
  });
});