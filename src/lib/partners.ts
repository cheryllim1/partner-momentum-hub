export type ActivationState = "At Risk of Dormancy" | "Dormant (90d+)" | "Activated (1st Deal Reg)" | "Newly Signed (0-30d)";
export type Tier = "Platinum" | "Gold" | "Silver" | "Bronze";
export interface Partner {
  id: string; name: string; tier: Tier; motion: string; region: string; partnerManager: string;
  daysSinceSigned: number; activationState: ActivationState; portalLoggedIn: boolean; salesKitDownloaded: boolean;
  accountOverlapCount: number; dealsRegistered: number; certifications: number; recommendedPlay: string;
}
export const PARTNERS: Partner[] = [
  { id: "PTR-201", name: "Nordic Digital Advisory", tier: "Gold", motion: "1:Few Cohort", region: "Nordics", partnerManager: "Marcus Lindqvist", daysSinceSigned: 74, activationState: "At Risk of Dormancy", portalLoggedIn: true, salesKitDownloaded: true, accountOverlapCount: 8, dealsRegistered: 0, certifications: 0, recommendedPlay: "Send 8 Overlapping Target Accounts + Co-Sell Spiff" },
  { id: "PTR-202", name: "Vanguard Cloud Partners", tier: "Bronze", motion: "1:Many Digital", region: "Benelux", partnerManager: "Automated Ops", daysSinceSigned: 112, activationState: "Dormant (90d+)", portalLoggedIn: false, salesKitDownloaded: false, accountOverlapCount: 3, dealsRegistered: 0, certifications: 0, recommendedPlay: "Automated Campaign-in-a-Box Sequence" },
  { id: "PTR-203", name: "Accenture Cloud EMEA", tier: "Platinum", motion: "1:1 Strategic", region: "UK & Ireland", partnerManager: "Sarah Jenkins", daysSinceSigned: 42, activationState: "Activated (1st Deal Reg)", portalLoggedIn: true, salesKitDownloaded: true, accountOverlapCount: 24, dealsRegistered: 2, certifications: 4, recommendedPlay: "Unlock SE Pre-Sales Support & Fast-Track Certs" },
  { id: "PTR-204", name: "Kestrel Systems Group", tier: "Silver", motion: "1:Many Digital", region: "DACH", partnerManager: "Automated Ops", daysSinceSigned: 19, activationState: "Newly Signed (0-30d)", portalLoggedIn: true, salesKitDownloaded: false, accountOverlapCount: 5, dealsRegistered: 0, certifications: 0, recommendedPlay: "Deliver Zero-Cost Sales Pitch Kit & ICP Guide" },
  { id: "PTR-205", name: "Stratos Enterprise Consulting", tier: "Platinum", motion: "1:1 Strategic", region: "France", partnerManager: "Claire Moreau", daysSinceSigned: 85, activationState: "At Risk of Dormancy", portalLoggedIn: true, salesKitDownloaded: true, accountOverlapCount: 14, dealsRegistered: 0, certifications: 1, recommendedPlay: "Book 1:1 Executive Account Mapping Session" },
  { id: "PTR-206", name: "Apex Cyber Solutions", tier: "Gold", motion: "1:Few Cohort", region: "North America", partnerManager: "David Chen", daysSinceSigned: 58, activationState: "Activated (1st Deal Reg)", portalLoggedIn: true, salesKitDownloaded: true, accountOverlapCount: 11, dealsRegistered: 1, certifications: 2, recommendedPlay: "Trigger 50% Certification Voucher on Deal #1" },
];

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
