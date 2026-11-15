import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, Target, AlertTriangle, Building2, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PARTNERS, computeKpis, partnerTiming, type ActivationState, type Tier } from "@/lib/partners";
import { TierBadge, StateBadge } from "@/components/hub/badges";
import { usePersisted } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { REGION_OPTIONS } from "@/lib/regions";
import { bronzePriority, onboardingPace } from "@/lib/onboarding";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Partner Activation and Enablement Pipeline | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "Track signed partners from onboarding to first deal registration and prevent dormancy." },
    { property: "og:title", content: "Partner Activation and Enablement Pipeline" },
    { property: "og:description", content: "Track partner opportunities, sales stages and recent activity." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Pipeline,
});

const STATES: { label: string; value: ActivationState | "All" }[] = [
  { label: "All", value: "All" }, { label: "Newly Signed", value: "Newly Signed (0-30d)" },
  { label: "Disengaged (30–89d)", value: "Disengaged" }, { label: "Dormant 90d+", value: "Dormant (90d+)" },
  { label: "Not Yet Activated", value: "Not Yet Activated" },
  { label: "Activated", value: "Activated (1st Deal Reg)" },
];
const TIERS: (Tier | "All")[] = ["All", "Platinum", "Gold", "Silver", "Bronze"];
const optionsFor = (key: "region" | "country" | "type") => [...new Set(PARTNERS.map((p) => p[key]))].sort();

function Pipeline() {
  const [sims] = usePersisted<string[]>("simulated-deals", []);
  const partners = useMemo(() => PARTNERS.map((p) => sims.includes(p.id) ? { ...p, dealsRegistered: Math.max(1, p.dealsRegistered), activationState: "Activated (1st Deal Reg)" as const, recommendedPlay: "Trigger 50% Certification Voucher on Deal #1" } : p), [sims]);
  const [state, setState] = useState<ActivationState | "All">("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [bronzeOnly, setBronzeOnly] = useState(false);
  const [milestones] = usePersisted<Record<string, string[]>>("onboarding-milestones", {});
  const rows = useMemo(() => {
    const filtered = partners.filter((p) => (state === "All" || p.activationState === state) && (tier === "All" || p.tier === tier) && (!region || p.region === region) && (!country || p.country === country) && (!type || p.type === type));
    return bronzeOnly ? bronzePriority(filtered, milestones) : filtered;
  }, [partners, state, tier, region, country, type, bronzeOnly, milestones]);
  const k = computeKpis(rows);

  const kpis = [
    { label: "Activation Rate (Signed → 1st Deal Reg)", value: `${k.activationRate.toFixed(1)}%`, icon: TrendingUp, tone: "text-success bg-success/10" },
    { label: "Open Opportunities", value: `${k.openOpportunities}`, icon: Building2, tone: "text-primary bg-primary/10" },
    { label: "Partners Inactive for 90+ Days", value: `${k.dormant} Partners`, icon: AlertTriangle, tone: "text-warning-foreground bg-warning/15" },
    { label: "Untapped Account Overlaps in Dormant Base", value: `${k.untapped} Warm Accounts`, icon: Target, tone: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Activation and Enablement Pipeline</h1>
          <p className="text-sm text-muted-foreground">Convert signed, passive partners into their first deal registration.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-y py-4">
        {[{ label: "Region", value: region, set: setRegion, options: REGION_OPTIONS }, { label: "Country", value: country, set: setCountry, options: optionsFor("country") }, { label: "Partner tier", value: tier === "All" ? "" : tier, set: (v: string) => setTier((v || "All") as Tier | "All"), options: TIERS.filter((v) => v !== "All") }, { label: "Partner type", value: type, set: setType, options: optionsFor("type") }].map((f) => <label key={f.label} className="min-w-40 flex-1 text-xs font-semibold text-muted-foreground">{f.label}<select aria-label={f.label} value={f.value} onChange={(e) => f.set(e.target.value)} className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground"><option value="">All</option>{f.options.map((v) => <option key={v}>{v}</option>)}</select></label>)}
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
        <Button size="sm" variant={bronzeOnly ? "default" : "outline"} aria-pressed={bronzeOnly} onClick={() => setBronzeOnly((prev) => !prev)}>Bronze Onboarding · First 90 Days</Button>
        <FilterGroup label="Activation State" options={STATES.map((s) => ({ label: s.label, value: s.value }))} value={state} onChange={(v) => setState(v as never)} />
        <span className="self-center text-xs text-muted-foreground">{rows.length} partners</span>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
        <table className="w-full min-w-[1100px] table-fixed text-xs">
          <colgroup>{["18%", "6%", "8%", "9%", "7%", "4%", "19%", "16%", "13%"].map((width, i) => <col key={i} style={{ width }} />)}</colgroup>
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>{["Partner", "Region", "Country", "Partner Type", "Tier", "Deals", "Opportunities & Stages", "Activity & Timing", "Status"].map((h, i) => <th key={i} className="px-2 py-3 break-words">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-2 py-3 break-words"><Link to="/partners/$partnerId" params={{ partnerId: p.id }} className="font-semibold text-primary hover:underline">{p.name}</Link></td>
                <td className="px-2 py-3 break-words text-muted-foreground">{p.region}</td>
                <td className="px-2 py-3 break-words text-muted-foreground">{p.country}</td>
                <td className="px-2 py-3 break-words text-muted-foreground">{p.type}</td>
                <td className="px-2 py-3 break-words"><TierBadge tier={p.tier} /></td>
                <td className="px-1 py-3 text-center font-bold">{p.dealsRegistered}</td>
                <td className="px-2 py-3">
                  <p className="mb-1 text-xs font-semibold">{p.opportunities} total · {p.opportunityStages.discovery + p.opportunityStages.solution + p.opportunityStages.proposal + p.opportunityStages.negotiation} open</p>
                  <div className="flex flex-wrap gap-1">{Object.entries(p.opportunityStages).map(([stage, n]) => <span key={stage} className="rounded border bg-muted/40 px-1.5 py-0.5 text-xs text-muted-foreground">{stage === "closedWon" ? "Won" : stage.charAt(0).toUpperCase() + stage.slice(1)} {n}</span>)}</div>
                </td>
                <td className="px-2 py-3 text-xs">
                  {partnerTiming(p) && <p className="font-medium text-foreground">{partnerTiming(p)}</p>}
                  <p className="mt-1 text-muted-foreground">{p.lastActiveUpdate}</p>
                  {bronzeOnly && <p className="mt-1 font-medium text-primary">{onboardingPace(p.daysSinceSigned, milestones[p.id] ?? [], p.dealsRegistered)}</p>}
                </td>
                <td className="px-2 py-3 break-words"><StateBadge state={p.activationState} compact /></td>
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
