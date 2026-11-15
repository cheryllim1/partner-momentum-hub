export const COSELL_MILESTONES = [
  { id: "aeAccepted", label: "AE acceptance" },
  { id: "introduced", label: "Intro happened" },
  { id: "advanced", label: "Opportunity advanced" },
] as const;
export type CoSellMilestone = typeof COSELL_MILESTONES[number]["id"];
export type CoSellProgress = {
  aeName: string;
  confirmations: Partial<Record<CoSellMilestone, string>>;
  lastPing?: string;
};
export const emptyCoSell = (): CoSellProgress => ({ aeName: "", confirmations: {} });
export function confirmCoSell(progress: CoSellProgress, milestone: CoSellMilestone, confirmed: boolean, at: string): CoSellProgress {
  const confirmations = { ...progress.confirmations };
  if (confirmed) confirmations[milestone] = at;
  else delete confirmations[milestone];
  return { ...progress, confirmations };
}
export function recordDemoPing(progress: CoSellProgress, at: string): CoSellProgress {
  return { ...progress, lastPing: at };
}
export function coSellMessage(partner: string, account: string, ae: string, stage: string) {
  return `Hi ${ae.trim()}, can we review the ${account} opportunity with ${partner}? The uploaded sales stage is ${stage}. Are you open to involving this partner and arranging an introduction to the prospect? Please share your acceptance, whether an introduction has happened, and any confirmed opportunity progress. Thanks.`;
}