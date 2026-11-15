import { describe, expect, it } from "vitest";
import { PARTNERS } from "./partners";
import { separatePartnerAccounts } from "./partner-accounts";

describe("uploaded account classification", () => {
  it("separates 27 active deployments from 66 pipeline co-sell accounts", () => {
    const accounts = separatePartnerAccounts(PARTNERS.flatMap((p) => p.currentCustomers));
    expect(accounts.currentCustomers).toHaveLength(27);
    expect(accounts.pipelineAccounts).toHaveLength(66);
    expect(accounts.currentCustomers?.every((a) => a.stage === "Closed Won")).toBe(true);
  });
  it("keeps missing account records unknown", () => {
    expect(separatePartnerAccounts(null)).toEqual({ currentCustomers: null, pipelineAccounts: null });
  });
});