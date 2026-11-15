import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Choose a valid date");
export const partnerWorkKey = z.object({ partnerId: text(100) });
export const followupInput = partnerWorkKey.extend({
  id: z.string().uuid().optional(), action: text(200), owner_name: text(120),
  due_date: dateOnly, notes: z.string().trim().max(4000),
  status: z.enum(["Open", "Completed"]),
});
export const interactionInput = partnerWorkKey.extend({
  occurred_on: dateOnly, channel: z.enum(["Meeting", "Email", "Call", "Slack", "Other"]),
  participants: text(500), summary: text(4000), outcome: text(2000), next_steps: z.string().trim().max(2000),
});
export type Followup = {
  id: string; partner_id: string; action: string; owner_name: string; due_date: string;
  notes: string; status: "Open" | "Completed"; created_by: string; updated_by: string;
  created_at: string; updated_at: string;
};
export type Interaction = {
  id: string; partner_id: string; occurred_on: string; channel: string; participants: string;
  summary: string; outcome: string; next_steps: string; created_by: string; recorded_by: string; created_at: string;
};
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function isOverdue(item: Pick<Followup, "status" | "due_date">, today: string) {
  return item.status === "Open" && item.due_date < today;
}
export function filterFollowups(items: Followup[], filter: string, owner: string, today: string) {
  return items.filter((item) => (!owner || item.owner_name === owner) &&
    (filter === "All" || (filter === "Overdue" ? isOverdue(item, today) : item.status === filter)))
    .sort((a, b) => a.due_date.localeCompare(b.due_date) || a.created_at.localeCompare(b.created_at));
}