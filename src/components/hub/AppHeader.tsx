import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

const tabs = [
  { to: "/", label: "Activation & Dormancy Pipeline" },
  { to: "/playbooks", label: "Demand-First Enablement Playbooks (1:1 / 1:Few / 1:Many)" },
  { to: "/rules", label: "Deal-Triggered Certification & Incentive Rules" },
] as const;

export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-3 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Rocket className="h-5 w-5" /></div>
          <div>
            <p className="text-base font-bold leading-tight text-foreground">Partner Activation & Dormancy Prevention Hub</p>
            <p className="text-xs text-muted-foreground">Signed → First Deal Registration, before paid certification</p>
          </div>
        </div>
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} activeOptions={{ exact: true }}
              className="whitespace-nowrap border-b-2 border-transparent pb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              activeProps={{ className: "!border-primary !text-primary" }}>{t.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
