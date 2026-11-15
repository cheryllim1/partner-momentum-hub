import type { Tier } from "./partners";

export const ONBOARDING_PHASES = [
  { id: "foundation", name: "Foundation", start: 0, due: 30, items: [
    { id: "portal", name: "Portal access & contacts" },
    { id: "kit", name: "Sales kit downloaded" },
    { id: "welcome", name: "Welcome call completed" },
  ] },
  { id: "gtm", name: "GTM Readiness", start: 31, due: 60, items: [
    { id: "tal", name: "Joint target accounts agreed" },
    { id: "battlecard", name: "Sales battlecard reviewed" },
    { id: "webinar", name: "Partner webinar attended" },
  ] },
  { id: "first-deal", name: "First Deal Registration", start: 61, due: 90, items: [
    { id: "deal", name: "First deal registered" },
    { id: "voucher", name: "Deal-triggered certification voucher arranged" },
    { id: "review", name: "90-day executive review completed" },
  ] },
] as const;

export type OnboardingPace = "On Track" | "At Risk of Stalling" | "Needs Immediate Outreach" | "Signing age unknown" | "Complete";
export function onboardingPace(days: number | null, done: readonly string[], deals: number): OnboardingPace {
  if (days === null) return "Signing age unknown";
  const complete = (id: string) => done.includes(id) || (id === "deal" && deals > 0);
  if (ONBOARDING_PHASES.every((phase) => phase.items.every((item) => complete(item.id)))) return "Complete";
  const overdue = ONBOARDING_PHASES.some((phase) => days > phase.due && phase.items.some((item) => !complete(item.id)));
  if (days >= 90 && overdue) return "Needs Immediate Outreach";
  return overdue ? "At Risk of Stalling" : "On Track";
}

export function bronzePriority<T extends { id: string; tier: Tier; daysSinceSigned: number; dealsRegistered: number }>(partners: T[], milestones: Record<string, string[]>) {
  const rank: Record<OnboardingPace, number> = { "Needs Immediate Outreach": 3, "At Risk of Stalling": 2, "On Track": 1, "Signing age unknown": 0, Complete: 0 };
  return partners.filter((p) => p.tier === "Bronze" && p.daysSinceSigned >= 0 && p.daysSinceSigned <= 90)
    .sort((a, b) => rank[onboardingPace(b.daysSinceSigned, milestones[b.id] ?? [], b.dealsRegistered)] - rank[onboardingPace(a.daysSinceSigned, milestones[a.id] ?? [], a.dealsRegistered)] || b.daysSinceSigned - a.daysSinceSigned);
}

export function toggleCompletion(done: readonly string[], id: string): string[] {
  return done.includes(id) ? done.filter((value) => value !== id) : [...done, id];
}

export function resourceLinkValid(value: string): boolean {
  if (!value.trim()) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}