import type { Partner, Tier } from "./partners";
export const PILLARS = ["Commercial", "Sales", "Product Roadmap", "Training / Enablement", "Support", "Marketing"] as const;
export type Pillar = (typeof PILLARS)[number];
export interface PlanItem { id: string; name: string; pillar: Pillar; action: string }
const P = (id: string, name: string, pillar: Pillar, action: string): PlanItem => ({ id, name, pillar, action });
export const PLANS: Record<"1:1" | "1:Few" | "1:Many", { label: string; items: PlanItem[] }> = {
  "1:1": { label: "1:1 Strategic Partners / Platinum Tier", items: [
    P("p1", "Joint Business Planning", "Commercial", "Schedule"),
    P("p2", "Custom GTM / Co-developed sales play", "Commercial", "Schedule"),
    P("p3", "Co-branded sales kit", "Sales", "Push"),
    P("p4", "Proof of concept", "Sales", "Push"),
    P("p5", "ROI calculator", "Sales", "Push"),
    P("p6", "Live co-sell demo", "Sales", "Push"),
    P("p7", "Dedicated Sandbox account", "Sales", "Push"),
    P("p8", "Upcoming features deep dive", "Product Roadmap", "Invite"),
    P("p9", "Pilot test", "Product Roadmap", "Invite"),
    P("p10", "Beta access", "Product Roadmap", "Invite"),
    P("p11", "Co-development inputs & feedbacks", "Product Roadmap", "Invite"),
    P("p12", "Custom training / Workshops", "Training / Enablement", "Assign"),
    P("p13", "1:1 shadowing with sales engineer", "Training / Enablement", "Assign"),
    P("p14", "Access to internal direct-sales enablement", "Training / Enablement", "Assign"),
    P("p15", "Regular refreshers every Q, with 2-3 success stories", "Training / Enablement", "Assign"),
    P("p16", "Dedicated Point of Contact", "Support", "Provide"),
    P("p17", "Dedicated PSM", "Support", "Provide"),
    P("p18", "Priority ticket routing", "Support", "Provide"),
    P("p19", "Executive sponsorship", "Support", "Provide"),
    P("p20", "Joint Demand Gen & Marketing Events", "Marketing", "Push"),
    P("p21", "Joint Webinars", "Marketing", "Push"),
    P("p22", "MDFs", "Marketing", "Push"),
    P("p23", "Executive Roundtables", "Marketing", "Push"),
    P("p24", "Custom whitepaper and Thought leadership assets", "Marketing", "Push"),
  ] },
  "1:Few": { label: "1:Few Segmented Partners / Gold Tier", items: [
    P("g1", "QBRs", "Commercial", "Schedule"),
    P("g2", "Targeted SPIFFs", "Commercial", "Schedule"),
    P("g3", "Vertical specific playbook", "Sales", "Push"),
    P("g4", "Scenario based use case decks", "Sales", "Push"),
    P("g5", "Competitor analysis / Battlecards", "Sales", "Push"),
    P("g6", "Product / Solution positioning statement", "Sales", "Push"),
    P("g7", "Shared demo environment", "Sales", "Push"),
    P("g8", "Feature validation", "Product Roadmap", "Invite"),
    P("g9", "Focus groups for vertical requirements", "Product Roadmap", "Invite"),
    P("g10", "Early product launch briefings", "Product Roadmap", "Invite"),
    P("g11", "Partner enablement bootcamps", "Training / Enablement", "Assign"),
    P("g12", "Certification specialisations", "Training / Enablement", "Assign"),
    P("g13", "Virtual Instructor-Led Training", "Training / Enablement", "Assign"),
    P("g14", "Regular refreshers every Q, with 2-3 success stories", "Training / Enablement", "Assign"),
    P("g15", "Monthly Drop-ins", "Support", "Provide"),
    P("g16", "Group troubleshooting", "Support", "Provide"),
    P("g17", "Targeted sales strategy alignment", "Support", "Provide"),
    P("g18", "Co-marketing assets", "Marketing", "Push"),
    P("g19", "PR campaigns", "Marketing", "Push"),
    P("g20", "Regional event support", "Marketing", "Push"),
    P("g21", "Joint success stories", "Marketing", "Push"),
  ] },
  "1:Many": { label: "1:Many Long-Tail Partners / Silver Tier", items: [
    P("m1", "Automated deal registration", "Commercial", "Schedule"),
    P("m2", "Partner onboarding & Partner Portal use", "Commercial", "Schedule"),
    P("m3", "Asset library", "Sales", "Push"),
    P("m4", "Interactive product tours / Value journey", "Sales", "Push"),
    P("m5", "Sales discovery guide", "Sales", "Push"),
    P("m6", "Shared demo environment", "Sales", "Push"),
    P("m7", "Business challenge oriented and buyer role specific guide", "Sales", "Push"),
    P("m8", "Ideal customer profiles", "Sales", "Push"),
    P("m9", "Guided selling scripts", "Sales", "Push"),
    P("m10", "Roadmap newsletter", "Product Roadmap", "Invite"),
    P("m11", "Feature announcement", "Product Roadmap", "Invite"),
    P("m12", "LMS / On demand partner academy", "Training / Enablement", "Assign"),
    P("m13", "Asynchronous micro-learning", "Training / Enablement", "Assign"),
    P("m14", "Community forum / Help page", "Support", "Provide"),
    P("m15", "Self-service knowledge base", "Support", "Provide"),
    P("m16", "FAQs", "Support", "Provide"),
    P("m17", "Campaign-in-a-box: plug and play social, email and blog templates", "Marketing", "Push"),
  ] },
};
export function planKey(p: Partner): keyof typeof PLANS {
  return p.motion.startsWith("1:1") ? "1:1" : p.motion.startsWith("1:Few") ? "1:Few" : "1:Many";
}
export function tierPlan(t: Tier) { return t === "Platinum" ? "1:1" : t === "Gold" ? "1:Few" : "1:Many"; }
/** Demo completion state seeded from partner signals. */
export function seedDone(p: Partner): Set<string> {
  const items = PLANS[planKey(p)].items;
  const ratio = p.dealsRegistered > 0 ? 0.75 : p.portalLoggedIn && p.salesKitDownloaded ? 0.45 : p.portalLoggedIn ? 0.25 : 0.1;
  return new Set(items.slice(0, Math.round(items.length * ratio)).filter((_, i) => i % 4 !== 3 || p.dealsRegistered > 0).map((i) => i.id));
}
export function readiness(total: number, done: number) { return total ? Math.round((done / total) * 100) : 0; }
