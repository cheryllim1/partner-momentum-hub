import { useState } from "react";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Deal } from "@/lib/deals";
import type { Partner } from "@/lib/partners";

export function PartnerEmailDialog({ deal, partner, onClose }: { deal: Deal; partner: Partner; onClose: () => void }) {
  const [to, setTo] = useState(partner.contact.email);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(`Joint co-selling introduction: ${partner.name} × ${deal.account}`);
  const [body, setBody] = useState(`Hi ${partner.contact.name} and ${deal.ae},\n\nI'd like to introduce ${partner.contact.name} from ${partner.name} to ${deal.ae}, the account executive managing the ${deal.account} opportunity.\n\nOpportunity: ${deal.account} (${deal.id})\nSales stage: ${deal.stage}\nAnnual recurring revenue: $${deal.arr.toLocaleString("en-US")}\nTarget close date: ${deal.close}\n\nWe would like to explore a joint co-selling approach. ${deal.ae}, would you be open to involving ${partner.name} and discussing a possible introduction to the prospect? ${partner.contact.name}, please share how your team could support this opportunity.\n\nIf there is mutual interest, let's align on account context, each team's role and next steps before contacting the prospect.\n\nBest regards,\n${partner.partnerManager}`);
  const field = "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground";
  const href = `mailto:${encodeURIComponent(to)}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
    <DialogHeader><DialogTitle>Email Partner</DialogTitle><DialogDescription>{partner.name} · {deal.account}. The AE's email has not been supplied; add it to Cc before opening your email app.</DialogDescription></DialogHeader>
    <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-muted-foreground">To<input aria-label="Email recipient" value={to} onChange={(e) => setTo(e.target.value)} className={field} /></label><label className="text-xs font-medium text-muted-foreground">Cc — {deal.ae}<input aria-label="AE email" value={cc} onChange={(e) => setCc(e.target.value)} className={field} placeholder="AE email address" /></label></div>
    <label className="text-xs font-medium text-muted-foreground">Subject<input aria-label="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={field} /></label>
    <label className="text-xs font-medium text-muted-foreground">Message<textarea aria-label="Co-selling email" value={body} onChange={(e) => setBody(e.target.value)} className={`${field} min-h-72`} /></label>
    <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`To: ${to}\nCc: ${cc}\nSubject: ${subject}\n\n${body}`); toast.success("Email draft copied"); } catch { toast.error("Could not copy the email draft"); } }}><Copy className="h-4 w-4" />Copy Email</Button><Button asChild><a href={href}><Mail className="h-4 w-4" />Open Email Draft</a></Button></div>
  </DialogContent></Dialog>;
}