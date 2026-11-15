import { Check, Circle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_PHASES, onboardingPace, toggleCompletion } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export function BronzeOnboarding({ days, deals, done, onChange, onResource }: { days: number | null; deals: number; done: string[]; onChange: (done: string[]) => void; onResource: (item: { id: string; name: string }) => void }) {
  const pace = onboardingPace(days, done, deals);
  return <section className="border-y py-5" aria-label="Bronze onboarding journey">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="flex items-center gap-2 text-base font-bold"><Flag className="h-4 w-4 text-primary" />Bronze Onboarding Journey</h2><p className="mt-1 text-xs text-muted-foreground">{days === null ? "Signing age not supplied" : `${days} days since signed`} · Manager-confirmed milestones</p></div>
      <span className={cn("rounded-md px-3 py-1 text-xs font-semibold", pace === "Needs Immediate Outreach" ? "bg-destructive/10 text-destructive" : pace === "At Risk of Stalling" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-foreground")}>{pace}</span>
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      {ONBOARDING_PHASES.map((phase) => {
        const complete = (id: string) => done.includes(id) || (id === "deal" && deals > 0);
        const count = phase.items.filter((item) => complete(item.id)).length;
        const active = days !== null && days >= phase.start && days <= phase.due;
        return <div key={phase.id} className="min-w-0">
          <div className={cn("mb-3 border-t-4 pt-3", count === phase.items.length ? "border-success" : active ? "border-primary" : "border-border")}>
            <p className="text-xs text-muted-foreground">Day {phase.start}–{phase.due} · {count}/{phase.items.length}</p><h3 className="mt-1 text-sm font-semibold">{phase.name}</h3>
          </div>
          <ul className="divide-y">{phase.items.map((item) => {
            const checked = complete(item.id);
            const uploaded = item.id === "deal" && deals > 0;
            return <li key={item.id} className="py-2">
              <div className="flex items-start gap-2"><Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label={`${checked ? "Unmark" : "Complete"} ${item.name}`} aria-pressed={checked} disabled={uploaded} onClick={() => onChange(toggleCompletion(done, item.id))}>{checked ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</Button><div className="min-w-0"><p className="pt-1 text-sm">{item.name}</p>{uploaded && <p className="text-xs text-muted-foreground">Recorded deal registration</p>}{!checked && <Button size="sm" variant="ghost" className="mt-1 h-7 px-0 text-xs text-primary" onClick={() => onResource({ id: `onboarding:${item.id}`, name: item.name })}>Push Resource</Button>}</div></div>
            </li>;
          })}</ul>
        </div>;
      })}
    </div>
  </section>;
}