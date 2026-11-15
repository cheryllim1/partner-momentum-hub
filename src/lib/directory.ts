import raw from "@/data/ot-partners.json";
import momentum from "@/data/ot-momentum.json";
import type { Tier } from "./partners";
import { PLANS, type PlanItem } from "./enablement";

export interface DirPartner {
  id: string; name: string; country: string; region: string; tier: Tier; type: string;
  segmentFocus: string; verticals: string[]; certifications: number; opportunities: number;
  closedWon: number; winRate: number; avgDealSize: number;
  contact: { name: string; role: string; email: string }; overview: string;
  partnerManager: string | null; activationState: string | null;
}
type Raw = (typeof raw)[number];
const mom = new Map(momentum.map((m) => [m.id, m]));
const clean = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim();

export const DIRECTORY: DirPartner[] = (raw as Raw[]).map((r) => {
  const m = mom.get(r.id);
  return {
    id: r.id, name: r.name, country: r.country || "—", region: r.region || "Unspecified",
    tier: r.tier as Tier, type: r.type, segmentFocus: r.segmentFocus,
    verticals: Array.from(new Set(r.productFocus.split(",").map((v) => v.trim().replace(" and ", " & ")).filter(Boolean))),
    certifications: r.certifications, opportunities: r.opportunities, closedWon: r.closedWon,
    winRate: r.winRate, avgDealSize: r.avgDealSize, contact: r.partnerContact, overview: clean(r.overview ?? ""),
    partnerManager: m?.partnerManager ?? null,
    activationState: m?.activationState ?? null,
  };
});

const uniq = (xs: string[]) => Array.from(new Set(xs)).sort();
export const REGIONS = uniq(DIRECTORY.map((p) => p.region));
export const TYPES = uniq(DIRECTORY.map((p) => p.type));
export const TIERS: Tier[] = ["Platinum", "Gold", "Silver", "Bronze"];

export interface Filters { q: string; tier: string; region: string; type: string }
export function filterPartners(ps: DirPartner[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  return ps.filter((p) =>
    (!f.tier || p.tier === f.tier) && (!f.region || p.region === f.region) && (!f.type || p.type === f.type) &&
    (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)));
}

export function planFor(t: Tier) { return PLANS[t === "Platinum" ? "1:1" : t === "Gold" ? "1:Few" : "1:Many"]; }
/** Example completion state derived from the partner's closed-won and certification counts. */
export function seedDoneDir(p: DirPartner): Set<string> {
  const items: PlanItem[] = planFor(p.tier).items;
  const ratio = Math.min(0.9, 0.1 + p.closedWon * 0.04 + p.certifications * 0.08);
  return new Set(items.slice(0, Math.round(items.length * ratio)).map((i) => i.id));
}

/** Per-partner incentive overrides set by the partner manager. */
export interface Overrides { voucherPct: number; seThreshold: number; spiffPct: number; enabled: boolean }
export function defaultOverrides(t: Tier): Overrides {
  return { voucherPct: 50, seThreshold: t === "Platinum" || t === "Gold" ? 0 : 50000, spiffPct: t === "Platinum" ? 5 : t === "Gold" ? 3 : 0, enabled: true };
}
export function incentivesWithOverrides(o: Overrides, dealSize: number) {
  if (!o.enabled) return [] as string[];
  const out = [`${o.voucherPct}% Technical Certification Voucher`];
  out.push(dealSize >= o.seThreshold ? "Assigned Solutions Engineer for Deal Support" : "Pooled SE Office Hours");
  if (o.spiffPct > 0) out.push(`First-Deal SPIFF: $${Math.round(dealSize * o.spiffPct / 100).toLocaleString("en-US")}`);
  return out;
}
