import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { askPartnerQuestion } from "@/lib/partner-insights.functions";

export function PartnerInsights() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ask = useServerFn(askPartnerQuestion);
  const submit = async () => {
    if (!question.trim() || pending) return;
    setPending(true); setError(null);
    const current = question.trim();
    try {
      const result = await ask({ data: { question: current, history: history.slice(-6) } });
      const answer = result.answer;
      if (answer) { setHistory((prev) => [...prev, { question: current, answer }]); setQuestion(""); }
      else setError(result.error);
    } catch { setError("Unable to reach AI. Your question has been kept."); }
    finally { setPending(false); }
  };
  return <><Button variant="outline" size="sm" onClick={() => setOpen(true)}><Sparkles className="h-4 w-4" />Ask AI</Button><Sheet open={open} onOpenChange={setOpen}><SheetContent className="flex w-full flex-col sm:max-w-xl">
    <SheetHeader><SheetTitle>Partner Insights</SheetTitle><SheetDescription>Uploaded partner snapshot · 604 profiles · Activity and account records for 30 partners</SheetDescription></SheetHeader>
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-4" aria-live="polite">{history.map((turn, i) => <div key={i} className="space-y-3 border-b pb-5"><p className="font-semibold text-foreground">{turn.question}</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{turn.answer}</p></div>)}{pending && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Reviewing partner evidence…</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-3 border-t pt-4"><textarea aria-label="Partner question" maxLength={2000} disabled={pending} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Which partners should I prioritize this week, and why?" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm text-foreground" /><div className="flex justify-between gap-2"><Button type="button" variant="ghost" size="sm" disabled={pending || !history.length} onClick={() => { setHistory([]); setError(null); }}><Trash2 className="h-4 w-4" />Clear</Button><Button type="submit" disabled={pending || !question.trim()}><Send className="h-4 w-4" />Ask Question</Button></div></form>
  </SheetContent></Sheet></>;
}