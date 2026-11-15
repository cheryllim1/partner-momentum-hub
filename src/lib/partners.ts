import momentum from "@/data/ot-momentum.json";
import master from "@/data/ot-partners.json";

const masterById = new Map(master.map((r) => [r.id, r]));
const masterByName = new Map(master.map((r) => [r.name.toLowerCase(), r]));
export const cleanHtml = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim();

export type ActivationState = "At Risk of Dormancy" | "Dormant (90d+)" | "Activated (1st Deal Reg)" | "Newly Signed (0-30d)";
export type Tier = "Platinum" | "Gold" | "Silver" | "Bronze";
export interface Partner {
  id: string; name: string; tier: Tier; motion: string; region: string; partnerManager: string;
  daysSinceSigned: number; activationState: ActivationState; portalLoggedIn: boolean; salesKitDownloaded: boolean;
  accountOverlapCount: number; dealsRegistered: number; certifications: number; recommendedPlay: string;
  contact: { name: string; role: string; email: string } | null; overview: string;
}
export const PARTNERS: Partner[] = momentum.map((m) => {
  const r = masterById.get(m.id) ?? masterByName.get(m.name.toLowerCase());
  return {
    ...(m as unknown as Omit<Partner, "contact" | "overview">),
    tier: m.tier as Tier, activationState: m.activationState as ActivationState,
    contact: m.partnerContact ?? r?.partnerContact ?? null, overview: cleanHtml(m.overview || r?.overview || ""),
  };
});

export function computeKpis(ps: Partner[]) {
  const activated = ps.filter((p) => p.dealsRegistered > 0);
  const risk = ps.filter((p) => p.dealsRegistered === 0 && (p.activationState === "At Risk of Dormancy" || p.activationState === "Dormant (90d+)"));
  return {
    activationRate: ps.length ? (activated.length / ps.length) * 100 : 0,
    avgDays: activated.length ? Math.round(activated.reduce((s, p) => s + p.daysSinceSigned, 0) / activated.length) : 0,
    atRisk: risk.length,
    untapped: risk.reduce((s, p) => s + p.accountOverlapCount, 0),
  };
}

const ACCOUNT_POOL = ["Volvo Cars", "Ericsson", "Spotify", "IKEA Group", "H&M", "Maersk", "Novo Nordisk", "Equinor", "Philips", "ING Bank", "ASML", "Heineken", "TotalEnergies", "L'Oréal", "BNP Paribas", "Capgemini", "Airbus", "Schneider Electric"];
export function overlapAccounts(p: Partner) {
  const start = Number(p.id.slice(-1)) * 3;
  return Array.from({ length: Math.min(p.accountOverlapCount, 6) }, (_, i) => ACCOUNT_POOL[(start + i) % ACCOUNT_POOL.length]);
}
export function playLabel(p: Partner) {
  if (p.motion.startsWith("1:Many")) return "Send Campaign-in-a-Box";
  if (p.motion.startsWith("1:1")) return "Book Account Mapping";
  return "Push Account Overlaps";
}

/** Incentives unlocked on first deal registration. */
export function incentivesFor(tier: Tier, dealSize: number, rule3: boolean) {
  if (!rule3) return [] as string[];
  const out = ["50% Technical Certification Voucher"];
  if (tier === "Platinum" || tier === "Gold" || dealSize >= 50000) out.push("Assigned Solutions Engineer for Deal Support");
  else out.push("Pooled SE Office Hours");
  if (tier === "Gold") out.push(`First-Deal SPIFF: $${Math.round(dealSize * 0.03).toLocaleString()}`);
  if (tier === "Platinum") out.push(`Co-Sell Bonus: $${Math.round(dealSize * 0.05).toLocaleString()}`, "Executive Sponsor Assigned");
  if (dealSize >= 100000) out.push("Fast-Track Certification Path (100% voucher)");
  return out;
}
