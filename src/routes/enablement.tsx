import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Send, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PILLARS, readiness } from "@/lib/enablement";
import { DIRECTORY, REGIONS, TYPES, TIERS, filterPartners, planFor, seedDoneDir, defaultOverrides, incentivesWithOverrides, type DirPartner, type Overrides } from "@/lib/directory";
import { TierBadge } from "@/components/hub/badges";
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
              <tr>{["Partner", "Tier", "Type", "Region", "Opps", "Closed Won", "Win Rate", "Avg Deal"].map((h) => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice((page - 1) * PAGE, page * PAGE).map((p) => (
                <tr key={p.id} onClick={() => set({ p: p.id })} className={cn("cursor-pointer border-t hover:bg-muted/40", p.id === s.p && "bg-primary/5")}>
                  <td className="px-4 py-2"><p className="font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.id} · {p.country}</p></td>
                  <td className="px-4 py-2"><TierBadge tier={p.tier} /></td>
                  <td className="px-4 py-2 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.region}</td>
                  <td className="px-4 py-2">{p.opportunities}</td>
                  <td className="px-4 py-2">{p.closedWon}</td>
                  <td className="px-4 py-2">{p.winRate}%</td>
                  <td className="px-4 py-2">{money(p.avgDealSize)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No partners match these filters.</td></tr>}
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

      {partner ? <Detail key={partner.id} partner={partner} /> : (
        <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">Select a partner in the table to see their full profile.</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold text-foreground">{value}</p></div>;
}

function Contact({ role, name, email }: { role: string; name?: string | null; email?: string | null }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{role}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{name ?? "Not on file"}</p>
      {email ? <a href={`mailto:${email}`} className="flex items-center gap-1 text-xs text-primary hover:underline"><Mail className="h-3 w-3" />{email}</a> : <p className="text-xs text-muted-foreground">No email on file</p>}
    </div>
  );
}

const overrideStore = new Map<string, Overrides>();

function Detail({ partner }: { partner: DirPartner }) {
  const plan = planFor(partner.tier);
  const [done, setDone] = useState(() => seedDoneDir(partner));
  const [o, setO] = useState<Overrides>(() => overrideStore.get(partner.id) ?? defaultOverrides(partner.tier));
  const upd = (patch: Partial<Overrides>) => setO((x) => { const n = { ...x, ...patch }; overrideStore.set(partner.id, n); return n; });
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
          <Stat label="Implementations Done" value={<span className="text-sm font-medium text-muted-foreground">Not in data yet</span>} />
          <Stat label="Partner Tier" value={partner.tier} />
          <Stat label="Partner Type" value={<span className="text-base">{partner.type}</span>} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Verticals / Product Focus</p>
          <div className="flex flex-wrap gap-2">{partner.verticals.map((v) => <span key={v} className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-foreground">{v}</span>)}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <p className="mb-3 text-sm font-bold text-foreground">Partner Contacts</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Contact role="CEO" />
            <Contact role={partner.contact.role} name={partner.contact.name} email={partner.contact.email} />
            <Contact role="Our Partner Manager" name={partner.partnerManager ?? "Unassigned (automated)"} />
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
                      <div key={i.id} className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2">
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
