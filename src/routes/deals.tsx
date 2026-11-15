import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, MapPin, Building2, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DEALS, matchesFor, type Deal } from "@/lib/deals";
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
  const [selected, setSelected] = useState<Deal | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
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
                <div className="space-y-4"><p className="text-3xl font-bold text-primary">${d.arr.toLocaleString()} ARR</p><Button onClick={() => { setSelected(d); setMessage(`Hi ${d.ae}, would you be open to bringing a partner into the ${d.account} opportunity (${d.stage}, $${d.arr.toLocaleString()} ARR), or introducing a partner to the prospect? Please let me know if you are willing to discuss.`); }}><MessageSquare className="h-4 w-4" />Ping AE on Slack</Button><p className="text-xs text-muted-foreground">{sent.includes(d.id) ? "Demo ping recorded · No Slack message sent" : "Demo only · No Slack message will be sent"}</p></div>
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
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ping {selected?.ae} on Slack</DialogTitle><DialogDescription>Demo only. No Slack message will be sent.</DialogDescription></DialogHeader>
          <label className="text-sm font-medium text-foreground">Message<textarea aria-label="Slack message" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 min-h-40 w-full rounded-md border bg-background p-3 text-sm text-foreground" /></label>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(message); toast.success("Message copied"); } catch { toast.error("Could not copy the message"); } }}><Copy className="h-4 w-4" />Copy Message</Button><Button disabled={!message.trim()} onClick={() => { if (!selected) return; setSent((prev) => [...prev, selected.id]); setSelected(null); toast.success("Demo ping recorded", { description: "No Slack message was sent." }); }}><Send className="h-4 w-4" />Simulate Slack Ping</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
