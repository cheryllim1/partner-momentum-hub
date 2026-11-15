import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PARTNERS } from "@/lib/partners";
import { PILLARS, PLANS, planKey, seedDone, readiness } from "@/lib/enablement";
import { TierBadge, StateBadge } from "@/components/hub/badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/enablement")({
  validateSearch: (s: Record<string, unknown>): { p?: string } => (typeof s.p === "string" ? { p: s.p } : {}),
  head: () => ({ meta: [
    { title: "Partner Enablement Tracker | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "See which tier enablement activities each partner has and hasn't completed, and push the next resource." },
    { property: "og:title", content: "Partner Enablement Tracker" },
    { property: "og:description", content: "Per-partner enablement gap analysis by tier and pillar." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Enablement,
});

function Enablement() {
  const { p: pid } = Route.useSearch();
  const navigate = useNavigate({ from: "/enablement" });
  const partner = PARTNERS.find((x) => x.id === pid) ?? PARTNERS[0]!;
  const [done, setDone] = useState<Record<string, Set<string>>>({});
  const d = done[partner.id] ?? seedDone(partner);
  const plan = PLANS[planKey(partner)];
  const score = readiness(plan.items.length, plan.items.filter((i) => d.has(i.id)).length);
  const missing = plan.items.length - plan.items.filter((i) => d.has(i.id)).length;
  const mark = (id: string) => { const n = new Set(d); n.add(id); setDone((s) => ({ ...s, [partner.id]: n })); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Partner Enablement Tracker</h1>
        <p className="text-sm text-muted-foreground">See what each partner has and hasn't done in their tier's enablement plan, and push the next resource.</p>
      </div>
      <div className="flex flex-wrap items-center gap-6 rounded-xl border bg-card p-5 shadow-card">
        <select value={partner.id} onChange={(e) => navigate({ search: { p: e.target.value } })} className="rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground">
          {PARTNERS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><TierBadge tier={partner.tier} /><StateBadge state={partner.activationState} /><span>{plan.label}</span><span>· {partner.partnerManager}</span><span>· {partner.daysSinceSigned}d signed</span></div>
        <div className="ml-auto min-w-48">
          <div className="flex justify-between text-xs font-semibold"><span className="text-muted-foreground">Enablement Readiness</span><span className="text-foreground">{score}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${score}%` }} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{missing} recommended pushes</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map((pl) => {
          const items = plan.items.filter((i) => i.pillar === pl);
          return (
            <div key={pl} className="rounded-xl border bg-card p-4 shadow-card">
              <p className="mb-3 text-sm font-bold text-foreground">{pl}</p>
              <div className="space-y-2">
                {items.map((i) => {
                  const ok = d.has(i.id);
                  return (
                    <div key={i.id} className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2">
                      <span className={cn("flex items-center gap-2 text-sm", ok ? "text-foreground" : "font-medium text-warning-foreground")}>
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", ok ? "bg-success/15 text-success" : "bg-warning/20")}>{ok ? <Check className="h-3 w-3" /> : "!"}</span>{i.name}
                      </span>
                      {ok ? <span className="text-xs text-success">Done</span> : (
                        <Button size="sm" variant="outline" onClick={() => { mark(i.id); toast.success(`${i.action}: ${i.name}`, { description: `Sent to ${partner.name}` }); }}><Send className="mr-1 h-3 w-3" />{i.action}</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
