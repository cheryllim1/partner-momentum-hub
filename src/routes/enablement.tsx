import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIRECTORY, REGIONS, TYPES, TIERS, filterPartners } from "@/lib/directory";
import { TierBadge } from "@/components/hub/badges";
import { PartnerDetail } from "@/components/hub/PartnerDetail";
import { cn } from "@/lib/utils";

type S = { p?: string | undefined; tier?: string | undefined; region?: string | undefined; type?: string | undefined; q?: string | undefined; page?: number | undefined };
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/enablement")({
  validateSearch: (s: Record<string, unknown>): S => ({ p: str(s["p"]), tier: str(s["tier"]), region: str(s["region"]), type: str(s["type"]), q: str(s["q"]), page: typeof s["page"] === "number" ? s["page"] : undefined }),
  head: () => ({ meta: [
    { title: "Partner Enablement Tracker | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "Filter 600+ partners by tier, region and type, and inspect each partner's performance, contacts, incentives and enablement gaps." },
    { property: "og:title", content: "Partner Enablement Tracker" },
    { property: "og:description", content: "Per-partner scorecards, custom incentive triggers and tier enablement gaps." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Enablement,
});

const PAGE = 15;
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const sel = "rounded-md border bg-background px-3 py-2 text-sm text-foreground";

function Enablement() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/enablement" });
  const set = (patch: Partial<S>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const rows = useMemo(() => filterPartners(DIRECTORY, { q: s.q ?? "", tier: s.tier ?? "", region: s.region ?? "", type: s.type ?? "" }), [s.q, s.tier, s.region, s.type]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const page = Math.min(s.page ?? 1, pages);
  const partner = DIRECTORY.find((x) => x.id === s.p);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Partner Enablement Tracker</h1>
        <p className="text-sm text-muted-foreground">Filter all {DIRECTORY.length} partners, pick one, and see their performance, contacts, incentives and enablement gaps.</p>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined, page: 1 })} placeholder="Search partner name or ID" className={cn(sel, "w-full pl-9")} />
          </div>
          <select aria-label="Tier" value={s.tier ?? ""} onChange={(e) => set({ tier: e.target.value || undefined, page: 1 })} className={sel}><option value="">All tiers</option>{TIERS.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="Region" value={s.region ?? ""} onChange={(e) => set({ region: e.target.value || undefined, page: 1 })} className={cn(sel, "max-w-56")}><option value="">All regions</option>{REGIONS.map((t) => <option key={t}>{t}</option>)}</select>
          <select aria-label="Partner type" value={s.type ?? ""} onChange={(e) => set({ type: e.target.value || undefined, page: 1 })} className={sel}><option value="">All partner types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <span className="text-sm text-muted-foreground">{rows.length} partners</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>{["Partner", "Tier", "Type", "Region", "Country", "Opps", "Closed Won", "Win Rate", "Avg Deal"].map((h) => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice((page - 1) * PAGE, page * PAGE).map((p) => (
                <tr key={p.id} onClick={() => navigate({ to: "/partners/$partnerId", params: { partnerId: p.id } })} className={cn("cursor-pointer border-t hover:bg-muted/40", p.id === s.p && "bg-primary/5")}>
                  <td className="px-4 py-2"><Link to="/partners/$partnerId" params={{ partnerId: p.id }} className="font-medium text-primary hover:underline">{p.name}</Link><p className="text-xs text-muted-foreground">{p.id} · {p.country}</p></td>
                  <td className="px-4 py-2"><TierBadge tier={p.tier} /></td>
                  <td className="px-4 py-2 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.region}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.country}</td>
                  <td className="px-4 py-2">{p.opportunities}</td>
                  <td className="px-4 py-2">{p.closedWon}</td>
                  <td className="px-4 py-2">{p.winRate}%</td>
                  <td className="px-4 py-2">{money(p.avgDealSize)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No partners match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-3 text-sm text-muted-foreground">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => set({ page: page - 1 })}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => set({ page: page + 1 })}>Next</Button>
          </div>
        </div>
      </div>

      {partner ? <PartnerDetail key={partner.id} partner={partner} /> : (
        <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">Select a partner in the table to see their full profile.</div>
      )}
    </div>
  );
}

