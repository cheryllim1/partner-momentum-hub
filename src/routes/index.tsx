import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, Building2, Mail, MessageSquare, Zap, TrendingUp, Clock, AlertTriangle, Target, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PARTNERS, computeKpis, overlapAccounts, playLabel, type Partner, type ActivationState, type Tier } from "@/lib/partners";
import { TierBadge, StateBadge } from "@/components/hub/badges";
import { usePersisted } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Activation & Dormancy Pipeline | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "Track signed partners from onboarding to first deal registration and prevent dormancy." },
    { property: "og:title", content: "Activation & Dormancy Pipeline" },
    { property: "og:description", content: "Track signed partners from onboarding to first deal registration." },
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
  const [sims, setSims] = usePersisted<string[]>("simulated-deals", []);
  const partners = useMemo(() => PARTNERS.map((p) => sims.includes(p.id) ? { ...p, dealsRegistered: Math.max(1, p.dealsRegistered), activationState: "Activated (1st Deal Reg)" as const, recommendedPlay: "Trigger 50% Certification Voucher on Deal #1" } : p), [sims]);
  const [state, setState] = useState<ActivationState | "All">("All");
  const [tier, setTier] = useState<Tier | "All">("All");
  const [active, setActive] = useState<Partner | null>(null);
  const k = computeKpis(partners);
  const rows = useMemo(() => partners.filter((p) => (state === "All" || p.activationState === state) && (tier === "All" || p.tier === tier)), [partners, state, tier]);

  const simulate = (id: string) => {
    setSims((s) => s.includes(id) ? s : [...s, id]);
    const p = partners.find((x) => x.id === id);
    toast.success(`${p?.name} registered their 1st deal`, { description: "50% certification voucher unlocked + Solutions Engineer assigned." });
    setActive(null);
  };

  const kpis = [
    { label: "Activation Rate (Signed → 1st Deal Reg)", value: `${k.activationRate.toFixed(1)}%`, icon: TrendingUp, tone: "text-success bg-success/10" },
    { label: "Avg Days to First Deal Registration", value: `${k.avgDays} Days`, icon: Clock, tone: "text-primary bg-primary/10" },
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
            <tr><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Days Signed</th><th className="px-4 py-3">Pre-Deal Readiness Signals</th><th className="px-4 py-3 text-center">Deals</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><p className="font-semibold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.id} · {p.motion} · {p.region || "Region not set"}</p>{p.contact && <p className="text-xs text-muted-foreground">{p.contact.role}: {p.contact.name} · <a className="text-primary hover:underline" href={`mailto:${p.contact.email}`}>{p.contact.email}</a></p>}<p className="text-xs text-muted-foreground">Partner Manager: {p.partnerManager}</p></td>
                <td className="px-4 py-3"><TierBadge tier={p.tier} /></td>
                <td className="px-4 py-3 font-medium">{p.daysSinceSigned}d</td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">
                  <Signal ok={p.portalLoggedIn} label="Portal Login" /><Signal ok={p.salesKitDownloaded} label="Sales Kit" />
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"><Building2 className="h-3 w-3" />{p.accountOverlapCount} overlaps</span>
                </div></td>
                <td className="px-4 py-3 text-center text-base font-bold">{p.dealsRegistered}</td>
                <td className="px-4 py-3"><StateBadge state={p.activationState} /></td>
                <td className="px-4 py-3 text-right">
                  {p.dealsRegistered === 0 ? (
                    <Button size="sm" onClick={() => setActive(p)}><Zap className="mr-1 h-3.5 w-3.5" />{playLabel(p)}</Button>
                  ) : <span className="text-xs text-muted-foreground">{p.recommendedPlay}</span>}
                  <Link to="/enablement" search={{ p: p.id }} className="mt-1 block text-xs font-medium text-primary hover:underline">Inspect Enablement →</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No partners match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <PlayModal partner={active} onClose={() => setActive(null)} onSimulate={simulate} />
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o.value} onClick={() => onChange(o.value)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", value === o.value ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function Signal({ ok, label }: { ok: boolean; label: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", ok ? "bg-success/10 text-success" : "bg-muted text-muted-foreground line-through")}>{ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{label}</span>;
}

function PlayModal({ partner: p, onClose, onSimulate }: { partner: Partner | null; onClose: () => void; onSimulate: (id: string) => void }) {
  if (!p) return <Dialog open={false} />;
  const accts = overlapAccounts(p);
  const first = p.partnerManager === "Automated Ops" ? "Partner Team" : p.partnerManager.split(" ")[0];
  const spiff = p.motion.startsWith("1:Few") ? "\n\nRegister your first deal in the next 30 days and earn a $2,500 co-sell SPIFF." : "";
  const email = `Subject: ${p.accountOverlapCount} warm accounts already in your book — let's co-sell\n\nHi ${p.name} team,\n\nWe ran an account overlap check and found ${p.accountOverlapCount} target accounts where you already have relationships and we have active pipeline interest:\n\n${accts.map((a) => `  • ${a}`).join("\n")}${p.accountOverlapCount > accts.length ? `\n  • …and ${p.accountOverlapCount - accts.length} more` : ""}\n\nNo certification required to start — your free Sales Kit and ICP guide are in the portal. Register any one of these as a deal and we'll unlock a 50% technical certification voucher and assign a Solutions Engineer.${spiff}\n\nBest,\n${first}`;
  const slack = `:rocket: *${p.name}* — ${p.daysSinceSigned}d signed, 0 deals.\nPlay: _${p.recommendedPlay}_\nTop overlaps: ${accts.slice(0, 3).join(", ")}\n<Register a deal> · <Book mapping session>`;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{p.name} <TierBadge tier={p.tier} /></DialogTitle>
          <DialogDescription>Recommended play: <span className="font-semibold text-foreground">{p.recommendedPlay}</span></DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="email">
          <TabsList><TabsTrigger value="email"><Mail className="mr-1 h-4 w-4" />Email</TabsTrigger><TabsTrigger value="slack"><MessageSquare className="mr-1 h-4 w-4" />Slack</TabsTrigger></TabsList>
          <TabsContent value="email"><pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 font-sans text-sm text-foreground">{email}</pre></TabsContent>
          <TabsContent value="slack"><pre className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 font-sans text-sm text-foreground">{slack}</pre></TabsContent>
        </Tabs>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { toast.success(`Activation play sent to ${p.name}`); onClose(); }}>Send Outreach</Button>
          <Button onClick={() => onSimulate(p.id)} className="bg-success text-success-foreground hover:bg-success/90"><Zap className="mr-1 h-4 w-4" />Simulate 1st Deal Reg</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
