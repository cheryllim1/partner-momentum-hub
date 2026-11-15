import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Gift, FileSignature, Timer, Trophy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { incentivesFor, type Tier } from "@/lib/partners";
import { TierBadge } from "@/components/hub/badges";
import { usePersisted } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [
    { title: "Deal-Triggered Certification & Incentive Rules | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "Demand Before Investment automation rules and first-deal incentive simulator." },
    { property: "og:title", content: "Deal-Triggered Certification & Incentive Rules" },
    { property: "og:description", content: "Unlock certification vouchers and SE support on first deal registration." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Rules,
});

const RULES = [
  { id: 1, icon: FileSignature, trigger: "Partner Signs Agreement (Day 0)", action: "Unlock Free Sales Kit & Account Overlap Check", note: "No paid certs required" },
  { id: 2, icon: Timer, trigger: "Partner Reaches Day 60 with 0 Deals", action: "Trigger Automated Account Overlap Nudge (1:Many) or PM Account Mapping Alert (1:1 / 1:Few)", note: "Dormancy prevention" },
  { id: 3, icon: Trophy, trigger: "Partner Submits 1st Deal Registration", action: "Unlock 50% Technical Certification Voucher + Assign Solutions Engineer for Deal Support", note: "Certification follows demand" },
];
const TIERS: Tier[] = ["Bronze", "Silver", "Gold", "Platinum"];

function Rules() {
  const [on, setOn] = usePersisted<Record<number, boolean>>("rules", { 1: true, 2: true, 3: true });
  const [tierIdx, setTierIdx] = useState(2);
  const [deal, setDeal] = useState(40000);
  const tier = TIERS[tierIdx] ?? "Gold";
  const incentives = incentivesFor(tier, deal, on[3] ?? false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Deal-Triggered Certification & Incentive Rules</h1>
        <p className="text-sm text-muted-foreground">The "Demand Before Investment" ruleset — partners earn certification support by bringing pipeline.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          {RULES.map((r) => (
            <div key={r.id} className={cn("rounded-xl border bg-card p-5 shadow-card transition-opacity", !on[r.id] && "opacity-50")}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">Rule {r.id} · {r.note}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">{on[r.id] ? "Enabled" : "Disabled"}<Switch checked={on[r.id] ?? false} onCheckedChange={(v) => setOn((s) => ({ ...s, [r.id]: v }))} /></div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-lg border bg-background p-3"><r.icon className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-[10px] font-semibold uppercase text-muted-foreground">When</p><p className="text-sm font-semibold text-foreground">{r.trigger}</p></div></div>
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
                <div className="flex-1 rounded-lg border border-primary/20 bg-accent p-3"><p className="text-[10px] font-semibold uppercase text-accent-foreground/70">Then</p><p className="text-sm font-semibold text-accent-foreground">{r.action}</p></div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <p className="font-bold text-foreground">First Deal Registration Simulator</p>
          <p className="mb-5 text-xs text-muted-foreground">Adjust tier and deal size to see what unlocks.</p>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Partner Tier</span><TierBadge tier={tier} /></div>
              <Slider min={0} max={3} step={1} value={[tierIdx]} onValueChange={(v) => setTierIdx(v[0] ?? 0)} />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">{TIERS.map((t) => <span key={t}>{t}</span>)}</div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Deal Size</span><span className="font-bold text-primary">${deal.toLocaleString()}</span></div>
              <Slider min={5000} max={250000} step={5000} value={[deal]} onValueChange={(v) => setDeal(v[0] ?? 5000)} />
            </div>
          </div>
          <div className="mt-6 rounded-lg border bg-background p-4">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Unlocked on 1st Deal Reg</p>
            {incentives.length ? (
              <ul className="space-y-2">{incentives.map((i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground"><Gift className="mt-0.5 h-4 w-4 shrink-0 text-success" />{i}</li>)}</ul>
            ) : <p className="text-sm text-muted-foreground">Rule 3 is disabled — no incentives fire on first deal registration.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
