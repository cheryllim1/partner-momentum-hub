import { Link } from "@tanstack/react-router";
import { Rocket, RotateCcw } from "lucide-react";
import { resetDemo } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/", label: "Partner Activation and Enablement Pipeline" },
  { to: "/deals", label: "Unattached Deals Matcher" },
  { to: "/enablement", label: "Partner Enablement Tracker" },
] as const;

export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-3 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Rocket className="h-5 w-5" /></div>
          <div>
            <p className="text-base font-bold leading-tight text-foreground">Partner Activation and Enablement Dashboard</p>
          </div>
          <Button variant="ghost" size="sm" onClick={resetDemo} className="ml-auto shrink-0 text-xs text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" />Reset Demo</Button>
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
