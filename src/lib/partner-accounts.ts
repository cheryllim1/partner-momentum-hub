export interface PartnerAccount {
  accountName: string;
  arr: number;
  stage: string;
  status: string;
  primaryVertical: string;
  products: { id: string; name: string; category: string; description: string }[];
  productsSource: string;
}

export function separatePartnerAccounts(accounts: PartnerAccount[] | null) {
  if (accounts === null) return { currentCustomers: null, pipelineAccounts: null };
  return {
    currentCustomers: accounts.filter((account) => account.status === "Active Deployment"),
    pipelineAccounts: accounts.filter((account) => account.status === "Pipeline Co-Sell"),
  };
}