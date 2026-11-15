import { cn } from "@/lib/utils";
import type { ActivationState, Tier } from "@/lib/partners";
const tierCls: Record<Tier, string> = {
  Platinum: "bg-primary/10 text-primary border-primary/20",
  Gold: "bg-warning/15 text-warning-foreground border-warning/30",
  Silver: "bg-muted text-muted-foreground border-border",
  Bronze: "bg-chart-1/10 text-chart-1 border-chart-1/25",
};
export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold", tierCls[tier])}>{tier}</span>;
}
const stateCls: Record<ActivationState, string> = {
  "Activated (1st Deal Reg)": "bg-success/12 text-success border-success/30",
  "Disengaged": "bg-warning/15 text-warning-foreground border-warning/30",
  "Not Yet Activated": "bg-muted text-muted-foreground border-border",
  "Dormant (90d+)": "bg-destructive/10 text-destructive border-destructive/25",
  "Newly Signed (0-30d)": "bg-accent text-accent-foreground border-primary/20",
};
export function StateBadge({ state }: { state: ActivationState }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold", stateCls[state])}>{state}</span>;
}
