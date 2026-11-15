import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Handshake, MapPin, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEALS, matchesFor } from "@/lib/deals";
import { TierBadge, StateBadge } from "@/components/hub/badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deals")({
  head: () => ({ meta: [
    { title: "Unattached Deals Matcher | Partner Activation and Enablement Dashboard" },
    { name: "description", content: "Match open direct deals with no partner attached to dormant and newly signed partners." },
    { property: "og:title", content: "Unattached Deals Matcher" },
    { property: "og:description", content: "Match open direct deals to partners that need activation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Deals,
});

function Deals() {
  const [intro, setIntro] = useState<Record<string, string>>({});
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Unattached Deals Matcher</h1>
        <p className="text-sm text-muted-foreground">Open direct deals with no partner attached, matched to partners that still need their first deal.</p>
      </div>
      <div className="space-y-4">
        {DEALS.map((d) => {
          const ms = matchesFor(d);
          return (
            <div key={d.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-foreground">{d.account}</p>
                  <p className="text-xs text-muted-foreground">{d.id} · {d.stage} · AE {d.ae} · Close {d.close} · {d.region}</p>
                </div>
                <p className="text-xl font-bold text-primary">${d.arr.toLocaleString()} ARR</p>
              </div>
              <div className="mt-4 space-y-2">
                {ms.length === 0 && <p className="text-xs text-muted-foreground">No suitable partner match yet.</p>}
                {ms.map((m) => {
                  const sent = intro[d.id] === m.partner.id;
                  return (
                    <div key={m.partner.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("rounded-md px-2 py-1 text-sm font-bold", m.score >= 70 ? "bg-success/10 text-success" : "bg-warning/15 text-warning-foreground")}>{m.score}%</span>
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">{m.partner.name} <TierBadge tier={m.partner.tier} /> <StateBadge state={m.partner.activationState} /></p>
                          <p className="mt-0.5 flex gap-3 text-xs text-muted-foreground">
                            {m.hasAccount && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />Existing relationship with {d.account}</span>}
                            {m.sameRegion && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />Same region</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild><Link to="/enablement" search={{ p: m.partner.id }}>Enablement</Link></Button>
                        <Button size="sm" disabled={!!intro[d.id]} onClick={() => { setIntro((s) => ({ ...s, [d.id]: m.partner.id })); toast.success(`Co-sell intro sent: ${d.ae} ↔ ${m.partner.name}`, { description: `${d.account} · registering this deal activates the partner.` }); }}>
                          {sent ? <><Check className="mr-1 h-3.5 w-3.5" />Intro Sent</> : <><Handshake className="mr-1 h-3.5 w-3.5" />Launch Co-Sell Intro</>}
                        </Button>
                      </div>
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
