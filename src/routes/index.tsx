import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, Target, AlertTriangle, Building2, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PARTNERS, computeKpis, partnerTiming, type ActivationState, type Tier } from "@/lib/partners";
import { TierBadge, StateBadge } from "@/components/hub/badges";
import { usePersisted } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Activation & Dormancy Pipeline | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "Track signed partners from onboarding to first deal registration and prevent dormancy." },
    { property: "og:title", content: "Activation & Dormancy Pipeline" },
    { property: "og:description", content: "Track partner opportunities, sales stages and recent activity." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Pipeline,
});

const STATES: { label: string; value: ActivationState | "All" }[] = [
  { label: "All", value: "All" }, { label: "Newly Signed", value: "Newly Signed (0-30d)" },
  { label: "At Risk of Dormancy", value: "At Risk of Dormancy" }, { label: "Dormant 90d+", value: "Dormant (90d+)" },
  { label: "Activated", value: "Activated (1st Deal Reg)" },
];
const TIERS: (Tier | "All")[] = ["All", "Platinum", "Gold", "Silver", "Bronze"];

function Pipeline() {
  const [sims] = usePersisted<string[]>("simulated-deals", []);
  const partners = useMemo(() => PARTNERS.map((p) => sims.includes(p.id) ? { ...p, dealsRegistered: Math.max(1, p.dealsRegistered), activationState: "Activated (1st Deal Reg)" as const, recommendedPlay: "Trigger 50% Certification Voucher on Deal #1" } : p), [sims]);
  const [state, setState] = useState<ActivationState | "All">("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const k = computeKpis(partners);
  const rows = useMemo(() => partners.filter((p) => (state === "All" || p.activationState === state) && (tier === "All" || p.tier === tier)), [partners, state, tier]);

  const kpis = [
    { label: "Activation Rate (Signed → 1st Deal Reg)", value: `${k.activationRate.toFixed(1)}%`, icon: TrendingUp, tone: "text-success bg-success/10" },
    { label: "Open Opportunities", value: `${k.openOpportunities}`, icon: Building2, tone: "text-primary bg-primary/10" },
    { label: "Partners At Risk / Dormant (0 Deals)", value: `${k.atRisk} Partners`, icon: AlertTriangle, tone: "text-warning-foreground bg-warning/15" },
    { label: "Untapped Account Overlaps in Dormant Base", value: `${k.untapped} Warm Accounts`, icon: Target, tone: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activation & Dormancy Pipeline</h1>
          <p className="text-sm text-muted-foreground">Convert signed, passive partners into their first deal registration.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className={cn("mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg", c.tone)}><c.icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 rounded-xl border bg-card p-4 shadow-card">
        <FilterGroup label="Activation State" options={STATES.map((s) => ({ label: s.label, value: s.value }))} value={state} onChange={(v) => setState(v as never)} />
        <FilterGroup label="Tier" options={TIERS.map((t) => ({ label: t, value: t }))} value={tier} onChange={(v) => setTier(v as never)} />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>{["Partner", "Region", "Partner Type", "Tier", "Deals", "Opportunities & Stages", "Activity & Timing", "Status", ""].map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><Link to="/partners/$partnerId" params={{ partnerId: p.id }} className="font-semibold text-primary hover:underline">{p.name}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{p.region}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                <td className="px-4 py-3"><TierBadge tier={p.tier} /></td>
                <td className="px-4 py-3 text-center font-bold">{p.dealsRegistered}</td>
                <td className="min-w-60 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold">{p.opportunities} total · {p.opportunityStages.discovery + p.opportunityStages.solution + p.opportunityStages.proposal + p.opportunityStages.negotiation} open</p>
                  <div className="flex flex-wrap gap-1">{Object.entries(p.opportunityStages).map(([stage, n]) => <span key={stage} className="rounded border bg-muted/40 px-1.5 py-0.5 text-xs text-muted-foreground">{stage === "closedWon" ? "Won" : stage.charAt(0).toUpperCase() + stage.slice(1)} {n}</span>)}</div>
                </td>
                <td className="min-w-48 px-4 py-3 text-xs">
                  {partnerTiming(p) && <p className="font-medium text-foreground">{partnerTiming(p)}</p>}
                  <p className="mt-1 text-muted-foreground">{p.lastActiveUpdate}</p>
                </td>
                <td className="px-4 py-3"><StateBadge state={p.activationState} /></td>
                <td className="px-4 py-3"><Button size="sm" variant="outline" asChild><Link to="/partners/$partnerId" params={{ partnerId: p.id }}>View Profile</Link></Button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No partners match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Button size="sm" variant="outline" key={o.value} onClick={() => onChange(o.value)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", value === o.value ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>{o.label}</Button>
        ))}
      </div>
    </div>
  );
}
