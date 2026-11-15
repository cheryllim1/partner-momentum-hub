import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, MapPin, Building2 } from "lucide-react";
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
            <div key={d.id} className="rounded-lg border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-5 border-b pb-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">{d.account}</p>
                  <p className="mt-2 text-base font-medium text-foreground">{d.stage}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm"><div><dt className="text-muted-foreground">Account executive</dt><dd className="font-semibold text-foreground">{d.ae}</dd></div><div><dt className="text-muted-foreground">Region</dt><dd className="text-foreground">{d.region}</dd></div><div><dt className="text-muted-foreground">Close date</dt><dd className="text-foreground">{d.close}</dd></div><div><dt className="text-muted-foreground">Opportunity</dt><dd className="text-foreground">{d.id}</dd></div></dl>
                </div>
                <div className="space-y-4"><p className="text-3xl font-bold text-primary">${d.arr.toLocaleString()} ARR</p><Button disabled title="AE Slack details and a Slack connection are required"><MessageSquare className="h-4 w-4" />Ping AE on Slack</Button><p className="text-xs text-muted-foreground">Slack not connected</p></div>
              </div>
              <div className="mt-4 space-y-2">
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">Recommended partners</h2>
                {ms.length === 0 && <p className="text-xs text-muted-foreground">No suitable partner match yet.</p>}
                {ms.map((m) => {
                  return (
                    <div key={m.partner.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={cn("rounded-md px-2 py-1 text-sm font-bold", m.score >= 70 ? "bg-success/10 text-success" : "bg-warning/15 text-warning-foreground")}>{m.score}%</span>
                        <div>
                          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">{m.partner.name} <TierBadge tier={m.partner.tier} /> <StateBadge state={m.partner.activationState} /></p>
                          <p className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {m.hasAccount && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />Existing relationship with {d.account}</span>}
                            {m.sameRegion && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />Same region</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild><Link to="/enablement" search={{ p: m.partner.id }}>Enablement</Link></Button>
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
