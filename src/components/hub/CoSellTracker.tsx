import { useState } from "react";
import { Check, Circle, MessageSquare, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePersisted } from "@/lib/demo-store";
import { COSELL_MILESTONES, confirmCoSell, emptyCoSell, recordDemoPing, coSellMessage, type CoSellProgress } from "@/lib/co-sell";
import type { PartnerAccount } from "@/lib/partner-accounts";

const timestamp = (value: string) => new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function CoSellTracker({ partnerId, partnerName, accounts }: { partnerId: string; partnerName: string; accounts: PartnerAccount[] | null }) {
  const [progress, setProgress] = usePersisted<Record<string, CoSellProgress>>(`co-sell:${partnerId}`, {});
  const [ping, setPing] = useState<{ key: string; account: PartnerAccount } | null>(null);
  const [aeName, setAeName] = useState("");
  const [message, setMessage] = useState("");
  const update = (key: string, change: (previous: CoSellProgress) => CoSellProgress) => setProgress((previous) => ({ ...previous, [key]: change(previous[key] ?? emptyCoSell()) }));

  return <section aria-label="Co-sell progress tracker" className="border-t py-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold text-foreground">Co-sell Progress</h2><span className="rounded border bg-muted px-2 py-1 text-xs text-muted-foreground">Demo · Manager-confirmed</span></div>
    <p className="mt-1 text-xs text-muted-foreground">Saved in this browser · No Slack messages sent</p>
    {accounts === null ? <p className="mt-4 text-sm text-muted-foreground">Pipeline account records have not been supplied for this partner.</p> : accounts.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No pipeline co-sell accounts in the uploaded records.</p> : <div className="mt-4 divide-y border-y">
      {accounts.map((account, index) => {
        const key = `${account.accountName}:${index}`;
        const item = progress[key] ?? emptyCoSell();
        return <article key={key} aria-label={`Co-sell progress for ${account.accountName}`} className="space-y-4 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><h3 className="break-words text-base font-semibold text-foreground">{account.accountName}</h3><p className="mt-1 text-xs text-muted-foreground">Uploaded stage: {account.stage} · {account.primaryVertical}</p><p className="mt-1 text-xs text-muted-foreground">{item.aeName ? `Account executive: ${item.aeName}` : "Account executive not supplied"}</p></div>
            <Button size="sm" variant="outline" onClick={() => { setPing({ key, account }); setAeName(item.aeName); setMessage(item.aeName ? coSellMessage(partnerName, account.accountName, item.aeName, account.stage) : ""); }}><MessageSquare className="h-4 w-4" />Ping AE on Slack</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">{COSELL_MILESTONES.map((milestone) => {
            const confirmedAt = item.confirmations[milestone.id];
            return <div key={milestone.id} className="flex min-w-0 items-start gap-2 border-l-2 border-border pl-3">
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" title={`${confirmedAt ? "Unmark" : "Confirm"} ${milestone.label}`} aria-label={`${confirmedAt ? "Unmark" : "Confirm"} ${milestone.label} for ${account.accountName}`} aria-pressed={Boolean(confirmedAt)} onClick={() => update(key, (previous) => confirmCoSell(previous, milestone.id, !confirmedAt, new Date().toISOString()))}>{confirmedAt ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</Button>
              <div className="min-w-0"><p className="text-sm font-medium text-foreground">{milestone.label}</p><p className="mt-1 text-xs text-muted-foreground">{confirmedAt ? `Confirmed ${timestamp(confirmedAt)}` : "Not confirmed"}</p></div>
            </div>;
          })}</div>
          {item.lastPing && <p className="text-xs text-muted-foreground">Demo ping recorded {timestamp(item.lastPing)} · No Slack message sent</p>}
        </article>;
      })}
    </div>}
    <Dialog open={ping !== null} onOpenChange={(open) => { if (!open) setPing(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Ping AE on Slack</DialogTitle><DialogDescription>Demo only · {ping?.account.accountName} · No Slack message will be sent.</DialogDescription></DialogHeader>
      <label className="block space-y-1 text-sm">Account executive name<Input maxLength={120} value={aeName} onChange={(e) => { const name = e.target.value; setAeName(name); if (ping) setMessage(name.trim() ? coSellMessage(partnerName, ping.account.accountName, name, ping.account.stage) : ""); }} /></label>
      <label className="block space-y-1 text-sm">Message<Textarea aria-label="Co-sell Slack message" className="min-h-44" maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
      <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={!message.trim()} onClick={async () => { try { await navigator.clipboard.writeText(message); toast.success("Message copied"); } catch { toast.error("Could not copy the message"); } }}><Copy className="h-4 w-4" />Copy Message</Button><Button disabled={!aeName.trim() || !message.trim()} onClick={() => { if (!ping) return; update(ping.key, (previous) => recordDemoPing({ ...previous, aeName: aeName.trim() }, new Date().toISOString())); setPing(null); toast.success("Demo ping recorded", { description: "No Slack message was sent. Progress is unchanged." }); }}><Send className="h-4 w-4" />Simulate Slack Ping</Button></div>
    </DialogContent></Dialog>
  </section>;
}