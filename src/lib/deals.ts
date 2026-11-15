import { PARTNERS, overlapAccounts, type Partner } from "./partners";
export interface Deal { id: string; account: string; arr: number; stage: string; ae: string; close: string; region: string }
export const DEALS: Deal[] = [
  { id: "OPP-9001", account: "Volvo Cars", arr: 120000, stage: "Stage 3 – Solution", ae: "Emma Berg", close: "2027-01-30", region: "Nordics" },
  { id: "OPP-9002", account: "ING Bank", arr: 85000, stage: "Stage 2 – Discovery", ae: "Joost de Vries", close: "2027-02-28", region: "Benelux" },
  { id: "OPP-9003", account: "Capgemini", arr: 180000, stage: "Stage 4 – Proposal", ae: "Luc Bernard", close: "2026-12-20", region: "France" },
  { id: "OPP-9004", account: "Maersk", arr: 45000, stage: "Stage 2 – Discovery", ae: "Emma Berg", close: "2027-03-15", region: "Nordics" },
  { id: "OPP-9005", account: "Heineken", arr: 64000, stage: "Stage 3 – Solution", ae: "Joost de Vries", close: "2027-01-10", region: "Benelux" },
  { id: "OPP-9006", account: "Schneider Electric", arr: 98000, stage: "Stage 3 – Solution", ae: "Luc Bernard", close: "2027-02-05", region: "France" },
];
/** Rank non-activated partners for a deal: account overlap (60), region (30), overlap breadth (10). */
export function matchesFor(d: Deal, ps: Partner[] = PARTNERS) {
  return ps.filter((p) => p.dealsRegistered === 0).map((p) => {
    const hasAccount = overlapAccounts(p).includes(d.account);
    const score = (hasAccount ? 60 : 0) + (p.region === d.region ? 30 : 0) + Math.min(10, p.accountOverlapCount);
    return { partner: p, score, hasAccount, sameRegion: p.region === d.region };
  }).filter((m) => m.score >= 30).sort((a, b) => b.score - a.score);
}
