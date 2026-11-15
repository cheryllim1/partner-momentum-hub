import { DIRECTORY } from "./directory";
import { PARTNERS } from "./partners";
import { separatePartnerAccounts } from "./partner-accounts";

export function partnerEvidence() {
  const momentum = new Map(PARTNERS.map((p) => [p.id, p]));
  return DIRECTORY.map((p) => {
    const activity = momentum.get(p.id);
    return {
      id: p.id, name: p.name, tier: p.tier, region: p.region || null, country: p.country, type: p.type,
      opportunities: p.opportunities, closedWonDeals: p.closedWon, winRatePct: p.winRate,
      avgDealSize: p.avgDealSize, certifications: p.certifications, implementationsDone: p.implementationsDone,
      openOpportunities: activity ? activity.opportunityStages.discovery + activity.opportunityStages.solution + activity.opportunityStages.proposal + activity.opportunityStages.negotiation : null,
      activity: activity ? { daysSinceLastActivity: activity.daysSinceLastActivity, lastUpdate: activity.lastActiveUpdate, status: activity.activationState, dealsRegistered: activity.dealsRegistered, opportunityStages: activity.opportunityStages } : null,
      ...separatePartnerAccounts(p.accounts?.map((account) => ({ ...account, products: [], productsSource: "Simulated products excluded from AI evidence" })) ?? null),
    };
  });
}