import type { Partner, Tier } from "./partners";
export const PILLARS = ["Commercial", "Sales", "Product Roadmap", "Training / Enablement", "Support", "Marketing"] as const;
export type Pillar = (typeof PILLARS)[number];
export interface PlanItem { id: string; name: string; pillar: Pillar; action: string }
const P = (id: string, name: string, pillar: Pillar, action: string): PlanItem => ({ id, name, pillar, action });
export const PLANS: Record<"1:1" | "1:Few" | "1:Many", { label: string; items: PlanItem[] }> = {
  "1:1": { label: "1:1 Platinum / Strategic", items: [
    P("p1", "Joint Business Plan", "Commercial", "Schedule JBP"), P("p2", "Quarterly Business Review", "Commercial", "Book QBR"),
    P("p3", "Joint Account Mapping", "Sales", "Book Mapping"), P("p4", "Live Co-Sell Demo", "Sales", "Assign SE"),
    P("p5", "Executive Roadmap Briefing", "Product Roadmap", "Invite"), P("p6", "1:1 SE Shadowing", "Training / Enablement", "Assign"),
    P("p7", "Dedicated Sandbox Account", "Support", "Provision"), P("p8", "Dedicated Partner Success Manager", "Support", "Assign PSM"),
    P("p9", "Co-Branded Sales Kit", "Marketing", "Push Kit"), P("p10", "Executive Roundtable", "Marketing", "Invite"),
  ] },
  "1:Few": { label: "1:Few Gold / Segmented", items: [
    P("g1", "Targeted First-Deal SPIFF Active", "Commercial", "Activate"), P("g2", "QBR Scheduled", "Commercial", "Book QBR"),
    P("g3", "Vertical Playbook", "Sales", "Push"), P("g4", "Competitor Battlecards", "Sales", "Push"), P("g5", "Shared Demo Environment", "Sales", "Provision"),
    P("g6", "Early Launch Briefing", "Product Roadmap", "Invite"), P("g7", "Vertical Focus Group", "Product Roadmap", "Invite"),
    P("g8", "Cohort Bootcamp", "Training / Enablement", "Invite"), P("g9", "Certification Specialization", "Training / Enablement", "Assign"),
    P("g10", "Monthly Drop-in Office Hours", "Support", "Invite"), P("g11", "Co-Marketing Assets", "Marketing", "Push"), P("g12", "Regional Event", "Marketing", "Invite"),
  ] },
  "1:Many": { label: "1:Many Silver & Bronze / Long-Tail", items: [
    P("m1", "Automated Deal Reg Portal Access", "Commercial", "Send Access"), P("m2", "Sales Discovery Guide", "Sales", "Push"),
    P("m3", "Guided Selling Scripts", "Sales", "Push"), P("m4", "Interactive Product Tours", "Product Roadmap", "Push"),
    P("m5", "LMS Micro-Learning Path", "Training / Enablement", "Assign"), P("m6", "Community Forum", "Support", "Invite"),
    P("m7", "Self-Serve Knowledge Base", "Support", "Push"), P("m8", "Campaign-in-a-Box", "Marketing", "Push"),
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
