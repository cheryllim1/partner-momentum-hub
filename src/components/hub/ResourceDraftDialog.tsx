import { useState } from "react";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DirPartner } from "@/lib/directory";
import { resourceLinkValid } from "@/lib/onboarding";

export function ResourceDraftDialog({ partner, item, url, onSaveLink, onClose }: { partner: DirPartner; item: { id: string; name: string }; url: string; onSaveLink: (url: string) => void; onClose: () => void }) {
  const [to, setTo] = useState(partner.contact.email);
  const [cc, setCc] = useState("");
  const [link, setLink] = useState(url);
  const [subject, setSubject] = useState(`${partner.name}: ${item.name}`);
  const [body, setBody] = useState(`Hi ${partner.contact.name || partner.name},\n\nLet's align on ${item.name.toLowerCase()} as part of your ${partner.tier} partner enablement plan.\n\nPlease review the resource and let us know a suitable next step, any support you need, and your expected completion date. We can also discuss the incentives available under your partner-specific agreement.\n\nBest regards${partner.partnerManager ? `,\n${partner.partnerManager}` : ""}`);
  const valid = resourceLinkValid(link);
  const message = `${body}${link.trim() ? `\n\nResource: ${link.trim()}` : ""}`;
  const field = "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground";
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
    <DialogHeader><DialogTitle>{item.name}</DialogTitle><DialogDescription>{partner.name} · {partner.tier} enablement</DialogDescription></DialogHeader>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-muted-foreground">To<input aria-label="Resource recipient" className={field} value={to} onChange={(e) => setTo(e.target.value)} /></label>
      <label className="text-xs text-muted-foreground">Cc<input aria-label="Resource Cc" className={field} value={cc} onChange={(e) => setCc(e.target.value)} /></label>
    </div>
    {partner.contacts?.ceo.email && <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => setCc((prev) => [...new Set([...prev.split(",").map((s) => s.trim()).filter(Boolean), partner.contacts?.ceo.email].filter(Boolean))].join(", "))}>Add CEO to Cc</Button>}
    <label className="text-xs text-muted-foreground">Resource link<input aria-label="Resource link" type="url" className={field} value={link} placeholder="https://" onChange={(e) => setLink(e.target.value)} /></label>
    {!valid && <p role="alert" className="text-xs text-destructive">Enter a valid https resource link.</p>}
    {!link && <p className="text-xs text-muted-foreground">No resource link supplied.</p>}
    <Button variant="outline" size="sm" disabled={!valid} className="justify-self-start" onClick={() => { onSaveLink(link.trim()); toast.success("Resource link saved"); }}>Save resource link</Button>
    <label className="text-xs text-muted-foreground">Subject<input aria-label="Resource subject" className={field} value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
    <label className="text-xs text-muted-foreground">Message<textarea aria-label="Resource message" className={`${field} min-h-56`} value={body} onChange={(e) => setBody(e.target.value)} /></label>
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="outline" disabled={!valid} onClick={async () => { try { await navigator.clipboard.writeText(`To: ${to}\nCc: ${cc}\nSubject: ${subject}\n\n${message}`); toast.success("Resource draft copied"); } catch { toast.error("Could not copy the draft"); } }}><Copy className="h-4 w-4" />Copy Draft</Button>
      {valid && <Button asChild><a href={`mailto:${encodeURIComponent(to)}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}><Mail className="h-4 w-4" />Open Email Draft</a></Button>}
    </div>
  </DialogContent></Dialog>;
}