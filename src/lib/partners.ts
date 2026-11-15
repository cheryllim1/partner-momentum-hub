import momentum from "@/data/ot-momentum.json";
import master from "@/data/ot-partners.json";
import { regionForCountry } from "./regions";
import type { PartnerAccount } from "./partner-accounts";

const masterById = new Map(master.map((r) => [r.id, r]));
const masterByName = new Map(master.map((r) => [r.name.toLowerCase(), r]));
export const cleanHtml = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim();

export type ActivationState = "Disengaged" | "Dormant (90d+)" | "Activated (1st Deal Reg)" | "Newly Signed (0-30d)" | "Not Yet Activated";
export type Tier = "Platinum" | "Gold" | "Silver" | "Bronze";
export type PartnerContact = { name: string; email: string; role?: string };
export interface Partner {
  id: string; name: string; tier: Tier; motion: string; region: string; country: string; type: string; partnerManager: string;
  daysSinceSigned: number; daysSinceLastDeal: number | null; lastActiveUpdate: string;
   activationState: ActivationState; daysSinceLastActivity: number | null; portalLoggedIn: boolean; salesKitDownloaded: boolean;
  accountOverlapCount: number; dealsRegistered: number; certifications: number; recommendedPlay: string;
  opportunities: number; opportunityStages: { discovery: number; solution: number; proposal: number; negotiation: number; closedWon: number };
  closedWon: number; winRate: number; avgDealSize: number; verticals: string[]; implementationsDone: number;
  contacts: { ceo: PartnerContact; partnerContact: PartnerContact; partnerManager: PartnerContact };
  contact: PartnerContact; overview: string;
  currentCustomers: PartnerAccount[];
}
const cleanContact = (c: PartnerContact): PartnerContact => ({ ...c, email: c.email.replace(/'/g, "") });
/** Read only explicit relative ages supplied in the uploaded activity description. */
export function activityAge(update: string): number | null {
  const match = update.match(/\b(\d+)\s*(?:d|days?)\s+ago\b/i);
  return match?.[1] === undefined ? null : Number(match[1]);
}
export function activityState(days: number | null, deals: number, newlySigned: boolean): ActivationState {
  if (days !== null && days >= 90) return "Dormant (90d+)";
  if (days !== null && days >= 30) return "Disengaged";
  if (deals > 0) return "Activated (1st Deal Reg)";
  return newlySigned ? "Newly Signed (0-30d)" : "Not Yet Activated";
}
export const PARTNERS: Partner[] = momentum.map((m) => {
  const r = masterById.get(m.id) ?? masterByName.get(m.name.toLowerCase());
  const contacts = { ceo: cleanContact(m.contacts.ceo), partnerContact: cleanContact(m.contacts.partnerContact), partnerManager: cleanContact(m.contacts.partnerManager) };
  return {
     ...m, tier: m.tier as Tier, region: regionForCountry(m.country) ?? "",
     daysSinceLastActivity: activityAge(m.lastActiveUpdate),
     activationState: activityState(activityAge(m.lastActiveUpdate), m.dealsRegistered, m.activationState === "Newly Signed (0-30d)"),
    contacts, contact: contacts.partnerContact, partnerManager: contacts.partnerManager.name,
    motion: m.tier === "Platinum" ? "1:1" : m.tier === "Gold" ? "1:Few" : "1:Many",
    portalLoggedIn: false, salesKitDownloaded: false, recommendedPlay: "",
    overview: cleanHtml(r?.overview ?? ""),
  };
});

export function partnerTiming(p: Pick<Partner, "tier" | "daysSinceSigned" | "daysSinceLastDeal">) {
  if (p.tier === "Bronze") return `${p.daysSinceSigned}d since signed`;
  return p.daysSinceLastDeal === null ? null : `${p.daysSinceLastDeal}d since last deal`;
}

export function computeKpis(ps: Partner[]) {
  const activated = ps.filter((p) => p.dealsRegistered > 0);
  const risk = ps.filter((p) => p.activationState === "Disengaged" || p.activationState === "Dormant (90d+)");
  return {
    activationRate: ps.length ? (activated.length / ps.length) * 100 : 0,
    openOpportunities: ps.reduce((s, p) => s + p.opportunityStages.discovery + p.opportunityStages.solution + p.opportunityStages.proposal + p.opportunityStages.negotiation, 0),
    atRisk: risk.length,
    dormant: ps.filter((p) => p.daysSinceLastActivity !== null && p.daysSinceLastActivity >= 90).length,
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
