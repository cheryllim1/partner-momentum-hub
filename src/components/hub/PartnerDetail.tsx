import { useState } from "react";
import { toast } from "sonner";
import { Check, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePersisted } from "@/lib/demo-store";
import { PILLARS, readiness } from "@/lib/enablement";
import { planFor, seedDoneDir, defaultOverrides, incentivesWithOverrides, type DirPartner, type Overrides } from "@/lib/directory";
import { TierBadge } from "@/components/hub/badges";
import { cn } from "@/lib/utils";
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const sel = "rounded-md border bg-background px-3 py-2 text-sm text-foreground";
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold text-foreground">{value}</p></div>;
}

function Contact({ role, name, email }: { role: string; name?: string | null; email?: string | null }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{role}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{name}</p>
      {email && <a href={`mailto:${email}`} className="flex items-center gap-1 break-all text-xs text-primary hover:underline"><Mail className="h-3 w-3" />{email}</a>}
    </div>
  );
}


export function PartnerDetail({ partner }: { partner: DirPartner }) {
  const plan = planFor(partner.tier);
  const [done, setDone] = useState(() => seedDoneDir(partner));
  const [o, setO] = usePersisted<Overrides>(`overrides:${partner.id}`, defaultOverrides(partner.tier));
  const upd = (patch: Partial<Overrides>) => setO((x) => ({ ...x, ...patch }));
  const doneCount = plan.items.filter((i) => done.has(i.id)).length;
  const score = readiness(plan.items.length, doneCount);
  const unlocks = incentivesWithOverrides(o, partner.avgDealSize);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-foreground">{partner.name}</h2><TierBadge tier={partner.tier} /></div>
            <p className="text-sm text-muted-foreground">{partner.id} · {partner.type} · {partner.region} · {partner.country} · {partner.segmentFocus}</p>
          </div>
          {partner.activationState && <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{partner.activationState}</span>}
        </div>
        {partner.overview && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{partner.overview}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Avg Deal Size" value={money(partner.avgDealSize)} />
          <Stat label="Opportunities" value={partner.opportunities} />
          <Stat label="Closed Won" value={partner.closedWon} />
          <Stat label="Avg Win Rate" value={`${partner.winRate}%`} />
          <Stat label="Certifications Done" value={partner.certifications} />
          {partner.implementationsDone !== null && <Stat label="Implementations Done" value={partner.implementationsDone} />}
          <Stat label="Partner Tier" value={partner.tier} />
          <Stat label="Partner Type" value={<span className="text-base">{partner.type}</span>} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Verticals / Product Focus</p>
          <div className="flex flex-wrap gap-2">{partner.verticals.map((v) => <span key={v} className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-foreground">{v}</span>)}</div>
        </div>
      </div>

      <section className="border-y py-5" aria-label="Current customers">
        <h2 className="text-base font-bold text-foreground">Current Customers</h2>
        <p className="mt-1 text-sm text-muted-foreground">{partner.closedWon === 0 ? "No closed-won deals recorded. Current-customer records have not been supplied." : `${partner.closedWon} closed-won deals · Current-customer records have not been supplied.`}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <p className="mb-3 text-sm font-bold text-foreground">Partner Contacts</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Contact role={partner.contact.role ?? "Alliance Contact"} name={partner.contact.name} email={partner.contact.email} />
            {partner.contacts && <Contact role="CEO" name={partner.contacts.ceo.name} email={partner.contacts.ceo.email} />}
            {partner.partnerManager && <Contact role="Our Partner Manager" name={partner.partnerManager} email={partner.partnerManagerEmail} />}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">First-Deal Incentives for This Partner</p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">Rule on<Switch checked={o.enabled} onCheckedChange={(v) => upd({ enabled: v })} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-muted-foreground">Cert voucher
              <select className={cn(sel, "mt-1 w-full")} value={o.voucherPct} onChange={(e) => upd({ voucherPct: Number(e.target.value) })}>{[25, 50, 75, 100].map((v) => <option key={v} value={v}>{v}%</option>)}</select>
            </label>
            <label className="text-xs text-muted-foreground">Dedicated SE from deal size
              <select className={cn(sel, "mt-1 w-full")} value={o.seThreshold} onChange={(e) => upd({ seThreshold: Number(e.target.value) })}>{[0, 25000, 50000, 100000].map((v) => <option key={v} value={v}>{v === 0 ? "Any deal" : money(v)}</option>)}</select>
            </label>
            <label className="text-xs text-muted-foreground">SPIFF (% of deal)
              <select className={cn(sel, "mt-1 w-full")} value={o.spiffPct} onChange={(e) => upd({ spiffPct: Number(e.target.value) })}>{[0, 2, 3, 5, 8].map((v) => <option key={v} value={v}>{v === 0 ? "None" : `${v}%`}</option>)}</select>
            </label>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Unlocked on first deal (at their avg deal {money(partner.avgDealSize)})</p>
          <ul className="mt-2 space-y-1">
            {unlocks.length ? unlocks.map((u) => <li key={u} className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-success" />{u}</li>) : <li className="text-sm text-muted-foreground">Rule is off for this partner.</li>}
          </ul>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => upd(defaultOverrides(partner.tier))}>Reset to tier defaults</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-bold text-foreground">{plan.label} Enablement Plan</p><p className="text-xs text-muted-foreground">{doneCount} completed · {plan.items.length - doneCount} not yet completed</p></div>
          <div className="min-w-48">
            <div className="flex justify-between text-xs font-semibold"><span className="text-muted-foreground">Readiness</span><span className="text-foreground">{score}%</span></div>
            <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((pl) => {
            const items = plan.items.filter((i) => i.pillar === pl);
            if (!items.length) return null;
            return (
              <div key={pl} className="rounded-lg border bg-background p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">{pl}</p>
                <div className="space-y-2">
                  {items.map((i) => {
                    const ok = done.has(i.id);
                    return (
                      <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-b px-1 py-2">
                        <span className={cn("flex items-center gap-2 text-sm", ok ? "text-foreground" : "font-medium text-warning-foreground")}>
                          <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs", ok ? "bg-success/15 text-success" : "bg-warning/20")}>{ok ? <Check className="h-3 w-3" /> : "!"}</span>{i.name}
                        </span>
                        {ok ? <span className="text-xs text-success">Done</span> : (
                          <Button size="sm" variant="outline" onClick={() => { setDone((d) => new Set(d).add(i.id)); toast.success(`${i.action}: ${i.name}`, { description: `Sent to ${partner.name}` }); }}><Send className="mr-1 h-3 w-3" />{i.action}</Button>
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
    </div>
  );
}
