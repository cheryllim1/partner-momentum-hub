import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Check, RotateCcw, Pencil, RefreshCw, CalendarClock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPartnerWork, savePartnerFollowup, recordPartnerInteraction } from "@/lib/partner-work.functions";
import { filterFollowups, isOverdue, localDate, type Followup } from "@/lib/partner-work";
import type { DirPartner } from "@/lib/directory";

const selectClass = "w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground";
const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const errorText = (error: unknown) => error instanceof Error ? error.message : "Unable to save. Please retry.";

export function PartnerWork({ partner }: { partner: DirPartner }) {
  const load = useServerFn(getPartnerWork);
  const save = useServerFn(savePartnerFollowup);
  const record = useServerFn(recordPartnerInteraction);
  const client = useQueryClient();
  const key = ["partner-work", partner.id];
  const query = useQuery({ queryKey: key, queryFn: () => load({ data: { partnerId: partner.id } }), retry: false, refetchInterval: 30000 });
  const [filter, setFilter] = useState("Open");
  const [owner, setOwner] = useState("");
  const [editing, setEditing] = useState<Followup | "new" | null>(null);
  const [logging, setLogging] = useState(false);
  const [action, setAction] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [occurredOn, setOccurredOn] = useState(localDate());
  const [channel, setChannel] = useState<"Meeting" | "Email" | "Call" | "Slack" | "Other">("Meeting");
  const [participants, setParticipants] = useState("");
  const [summary, setSummary] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const saveMutation = useMutation({ mutationFn: save, onSuccess: async () => { setEditing(null); await client.invalidateQueries({ queryKey: key }); } });
  const logMutation = useMutation({ mutationFn: record, onSuccess: async () => { setLogging(false); await client.invalidateQueries({ queryKey: key }); } });
  const statusMutation = useMutation({ mutationFn: save, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  const today = localDate();
  const items = query.data?.followups ?? [];
  const interactions = query.data?.interactions ?? [];
  const owners = [...new Set(items.map((i) => i.owner_name))].sort();
  const available = Boolean(query.data) && !query.isError;
  const startEdit = (item: Followup | "new") => {
    saveMutation.reset(); setEditing(item);
    setAction(item === "new" ? "" : item.action);
    setOwnerName(item === "new" ? partner.partnerManager ?? "" : item.owner_name);
    setDueDate(item === "new" ? "" : item.due_date);
    setNotes(item === "new" ? "" : item.notes);
  };
  const changeStatus = (item: Followup) => statusMutation.mutate({ data: { partnerId: partner.id, id: item.id, action: item.action, owner_name: item.owner_name, due_date: item.due_date, notes: item.notes, status: item.status === "Open" ? "Completed" : "Open" } });

  return <section aria-label="Follow-ups and interaction history" className="space-y-6 border-t py-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-bold text-foreground">Follow-ups & Interaction History</h2><p className="text-xs text-muted-foreground">Shared partner records · {partner.name}</p></div>
      <Button variant="ghost" size="icon" title="Refresh shared records" aria-label="Refresh shared records" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" /></Button>
    </div>
    {query.isPending && <p className="text-sm text-muted-foreground" role="status">Loading shared records…</p>}
    {query.isError && <p className="text-sm text-destructive" role="alert">{errorText(query.error)}</p>}
    {statusMutation.isError && <p className="text-sm text-destructive" role="alert">{errorText(statusMutation.error)}</p>}
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-primary" />Follow-ups</h3><Button size="sm" disabled={!available} onClick={() => startEdit("new")}><Plus className="h-4 w-4" />Add Follow-up</Button></div>
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Follow-up status">{["Open", "Overdue", "Completed", "All"].map((value) => <Button key={value} size="sm" variant={filter === value ? "secondary" : "ghost"} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}{value === "Overdue" && available ? ` (${items.filter((i) => isOverdue(i, today)).length})` : ""}</Button>)}</div>
        <select aria-label="Follow-up owner filter" className={`${selectClass} sm:max-w-56`} value={owner} onChange={(e) => setOwner(e.target.value)}><option value="">All owners</option>{owners.map((name) => <option key={name}>{name}</option>)}</select>
      </div>
      {available && <div className="mt-3 divide-y border-y">
        {filterFollowups(items, filter, owner, today).map((item) => <article key={item.id} className="flex items-start gap-3 py-4">
          <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" title={item.status === "Open" ? "Complete follow-up" : "Reopen follow-up"} aria-label={`${item.status === "Open" ? "Complete" : "Reopen"} ${item.action}`} disabled={statusMutation.isPending} onClick={() => changeStatus(item)}>{item.status === "Open" ? <Check className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}</Button>
          <div className="min-w-0 flex-1"><p className="break-words font-medium text-foreground">{item.action}</p><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className="break-words">{item.owner_name}</span><span>Due {dateLabel(item.due_date)}</span><span className={isOverdue(item, today) ? "font-semibold text-destructive" : item.status === "Completed" ? "text-success" : "text-muted-foreground"}>{isOverdue(item, today) ? "Overdue" : item.status}</span></div>{item.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.notes}</p>}</div>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" title="Edit follow-up" aria-label={`Edit ${item.action}`} onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
        </article>)}
        {!filterFollowups(items, filter, owner, today).length && <p className="py-5 text-sm text-muted-foreground">No follow-ups in this view.</p>}
      </div>}
    </div>
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-semibold"><MessageSquare className="h-4 w-4 text-primary" />Interaction History</h3><Button size="sm" variant="outline" disabled={!available} onClick={() => { logMutation.reset(); setOccurredOn(localDate()); setChannel("Meeting"); setParticipants(""); setSummary(""); setOutcome(""); setNextSteps(""); setLogging(true); }}><Plus className="h-4 w-4" />Log Interaction</Button></div>
      {available && <div className="mt-3 divide-y border-y">{interactions.map((item) => <article key={item.id} className="space-y-2 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="rounded border px-2 py-1 font-medium text-foreground">{item.channel}</span><time dateTime={item.occurred_on}>{dateLabel(item.occurred_on)}</time><span>Recorded by {item.recorded_by}</span></div>
        <p className="break-words text-xs text-muted-foreground">Participants: {item.participants}</p><p className="whitespace-pre-wrap break-words text-sm text-foreground">{item.summary}</p>
        <p className="whitespace-pre-wrap break-words text-sm"><span className="font-semibold">Outcome: </span>{item.outcome}</p>
        {item.next_steps && <p className="whitespace-pre-wrap break-words text-sm"><span className="font-semibold">Agreed next steps: </span>{item.next_steps}</p>}
      </article>)}{!interactions.length && <p className="py-5 text-sm text-muted-foreground">No interactions recorded.</p>}</div>}
    </div>
    <Dialog open={editing !== null} onOpenChange={(open) => { if (!open && !saveMutation.isPending) setEditing(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{editing === "new" ? "Add Follow-up" : "Edit Follow-up"}</DialogTitle><DialogDescription>{partner.name}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ data: { partnerId: partner.id, id: editing && editing !== "new" ? editing.id : undefined, action, owner_name: ownerName, due_date: dueDate, notes, status: editing && editing !== "new" ? editing.status : "Open" } }); }}>
        <label className="block space-y-1 text-sm">Next action<Input required maxLength={200} value={action} onChange={(e) => setAction(e.target.value)} /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1 text-sm">Owner<Input required maxLength={120} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} list={`owners-${partner.id}`} /><datalist id={`owners-${partner.id}`}>{owners.map((name) => <option key={name} value={name} />)}</datalist></label><label className="block space-y-1 text-sm">Due date<Input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label></div>
        <label className="block space-y-1 text-sm">Notes<Textarea maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        {saveMutation.isError && <p role="alert" className="text-sm text-destructive">{errorText(saveMutation.error)}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={saveMutation.isPending} onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={saveMutation.isPending || !action.trim() || !ownerName.trim() || !dueDate}>{saveMutation.isPending ? "Saving…" : "Save Follow-up"}</Button></div>
      </form>
    </DialogContent></Dialog>
    <Dialog open={logging} onOpenChange={(open) => { if (!logMutation.isPending) setLogging(open); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Log Interaction</DialogTitle><DialogDescription>{partner.name}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); logMutation.mutate({ data: { partnerId: partner.id, occurred_on: occurredOn, channel, participants, summary, outcome, next_steps: nextSteps } }); }}>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1 text-sm">Interaction date<Input required type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} /></label><label className="block space-y-1 text-sm">Channel<select className={selectClass} value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>{["Meeting", "Email", "Call", "Slack", "Other"].map((value) => <option key={value}>{value}</option>)}</select></label></div>
        <label className="block space-y-1 text-sm">Participants<Input required maxLength={500} value={participants} onChange={(e) => setParticipants(e.target.value)} /></label>
        <label className="block space-y-1 text-sm">Summary<Textarea required maxLength={4000} value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
        <label className="block space-y-1 text-sm">Outcome<Textarea required maxLength={2000} value={outcome} onChange={(e) => setOutcome(e.target.value)} /></label>
        <label className="block space-y-1 text-sm">Agreed next steps<Textarea maxLength={2000} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} /></label>
        {logMutation.isError && <p role="alert" className="text-sm text-destructive">{errorText(logMutation.error)}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={logMutation.isPending} onClick={() => setLogging(false)}>Cancel</Button><Button type="submit" disabled={logMutation.isPending || !participants.trim() || !summary.trim() || !outcome.trim()}>{logMutation.isPending ? "Saving…" : "Save Interaction"}</Button></div>
      </form>
    </DialogContent></Dialog>
  </section>;
}