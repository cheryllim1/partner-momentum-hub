import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playbooks")({
  head: () => ({ meta: [
    { title: "Demand-First Enablement Playbooks | Partner Activation Hub" },
    { name: "description", content: "1:1, 1:Few and 1:Many enablement plays that drive activation without upfront certification costs." },
    { property: "og:title", content: "Demand-First Enablement Playbooks" },
    { property: "og:description", content: "Scale partner activation across 1:1, 1:Few and 1:Many motions." },
  ] }),
  component: Playbooks,
});

const PILLARS = ["All Pillars", "Commercial", "Sales", "Product Roadmap", "Training / Enablement", "Support", "Marketing"] as const;
type Pillar = (typeof PILLARS)[number];
type Item = { name: string; pillar: Pillar; desc: string };
const COLS: { title: string; tiers: string; icon: typeof User; items: Item[] }[] = [
  { title: "1:1 Strategic", tiers: "Platinum", icon: User, items: [
    { name: "Dedicated Partner Manager", pillar: "Commercial", desc: "Named PM owns the path to first deal reg." },
    { name: "Joint Account Mapping", pillar: "Sales", desc: "Map overlapping accounts in a live working session." },
    { name: "Co-Branded Sales Kit", pillar: "Marketing", desc: "Pitch deck and one-pagers with partner branding." },
    { name: "Live Co-Sell Demo", pillar: "Sales", desc: "Our SE joins the first customer demo." },
    { name: "Dedicated Sandbox", pillar: "Support", desc: "Private environment for prospect POCs." },
    { name: "Executive Sponsorship", pillar: "Product Roadmap", desc: "Exec sponsor plus roadmap previews." },
  ] },
  { title: "1:Few Segmented", tiers: "Gold", icon: Users, items: [
    { name: "Cohort Office Hours", pillar: "Training / Enablement", desc: "Bi-weekly deal clinics by vertical cohort." },
    { name: "Vertical Playbooks", pillar: "Sales", desc: "Industry-specific discovery and pitch guides." },
    { name: "Competitor Battlecards", pillar: "Sales", desc: "Win themes against top competitors." },
    { name: "Shared Demo Environment", pillar: "Support", desc: "Pre-built demo tenant shared by the cohort." },
    { name: "Targeted First-Deal SPIFFs", pillar: "Commercial", desc: "Cash bonus for first registered deal." },
  ] },
  { title: "1:Many Long-Tail", tiers: "Silver & Bronze", icon: Globe, items: [
    { name: "Automated Deal Reg Portal", pillar: "Commercial", desc: "Register a deal in under 2 minutes." },
    { name: "Guided Selling Scripts", pillar: "Sales", desc: "Step-by-step call and email scripts." },
    { name: "Interactive Product Tours", pillar: "Product Roadmap", desc: "Click-through tours of the product and what's next." },
    { name: "Self-Serve Knowledge Base", pillar: "Training / Enablement", desc: "On-demand micro-lessons, free." },
    { name: "Campaign-in-a-Box Templates", pillar: "Marketing", desc: "Ready-to-launch email and social campaigns." },
  ] },
];

function Playbooks() {
  const [pillar, setPillar] = useState<Pillar>("All Pillars");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Demand-First Enablement Playbooks</h1>
        <p className="text-sm text-muted-foreground">Scale activation by motion — demand and deal support first, paid certification later.</p>
      </div>
      <div className="flex flex-wrap gap-1.5 rounded-xl border bg-card p-3 shadow-card">
        {PILLARS.map((p) => (
          <button key={p} onClick={() => setPillar(p)} className={cn("rounded-full border px-3 py-1 text-xs font-medium", pillar === p ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{p}</button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {COLS.map((c) => {
          const items = c.items.filter((i) => pillar === "All Pillars" || i.pillar === pillar);
          return (
            <div key={c.title} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
                <div><p className="font-bold text-foreground">{c.title}</p><p className="text-xs text-muted-foreground">{c.tiers}</p></div>
              </div>
              <div className="space-y-2.5">
                {items.map((i) => (
                  <div key={i.name} className="rounded-lg border bg-background p-3">
                    <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-foreground">{i.name}</p><span className="whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">{i.pillar}</span></div>
                    <p className="mt-1 text-xs text-muted-foreground">{i.desc}</p>
                  </div>
                ))}
                {items.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No plays in this pillar for this motion.</p>}
              </div>
              <p className="mt-4 rounded-md bg-success/10 px-3 py-2 text-xs font-medium text-success">No paid certification required to start</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
