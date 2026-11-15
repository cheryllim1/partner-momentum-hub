import { describe, expect, it } from "vitest";
import { PARTNERS } from "./partners";
import { separatePartnerAccounts } from "./partner-accounts";
import products from "@/data/ot-products.json";

describe("uploaded account classification", () => {
  it("assigns one to three distinct catalog products per account as simulated data", () => {
    const catalog = new Set(products.map((p) => p.id));
    const accounts = PARTNERS.flatMap((p) => p.currentCustomers);
    expect(accounts).toHaveLength(93);
    for (const account of accounts) {
      expect(account.products.length).toBeGreaterThanOrEqual(1);
      expect(account.products.length).toBeLessThanOrEqual(3);
      expect(new Set(account.products.map((p) => p.id)).size).toBe(account.products.length);
      expect(account.products.every((p) => catalog.has(p.id))).toBe(true);
      expect(account.productsSource).toBe("Simulated");
    }
  });
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