import { describe, expect, it } from "vitest";
import { dateOnly, filterFollowups, followupInput, interactionInput, isOverdue, type Followup } from "./partner-work";

const item = (patch: Partial<Followup>): Followup => ({ id: "one", partner_id: "partner-1", action: "Agree next meeting", owner_name: "Manager A", due_date: "2026-11-15", status: "Open", notes: "", created_by: "", updated_by: "", created_at: "2026-11-01", updated_at: "2026-11-01", ...patch });
describe("shared partner work", () => {
  it("flags only open follow-ups before today as overdue", () => {
    expect(isOverdue(item({ due_date: "2026-11-14" }), "2026-11-15")).toBe(true);
    expect(isOverdue(item({}), "2026-11-15")).toBe(false);
    expect(isOverdue(item({ due_date: "2026-11-14", status: "Completed" }), "2026-11-15")).toBe(false);
  });
  it("filters by owner and puts earliest due actions first", () => {
    const rows = [item({ id: "later", due_date: "2026-11-20" }), item({ id: "other", owner_name: "Manager B" }), item({ id: "first", due_date: "2026-11-14" })];
    expect(filterFollowups(rows, "Open", "Manager A", "2026-11-15").map((r) => r.id)).toEqual(["first", "later"]);
    expect(filterFollowups(rows, "Overdue", "", "2026-11-15").map((r) => r.id)).toEqual(["first"]);
  });
  it("requires an action, owner and valid due date", () => {
    const valid = { partnerId: "partner-1", action: "Review pipeline", owner_name: "Manager A", due_date: "2026-11-20", status: "Open", notes: "" };
    expect(followupInput.safeParse(valid).success).toBe(true);
    for (const patch of [{ action: " " }, { owner_name: "" }, { due_date: "2026-02-30" }]) expect(followupInput.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
  it("requires dated interactions with participants and outcome", () => {
    const valid = { partnerId: "partner-1", occurred_on: "2026-11-15", channel: "Meeting", participants: "Partner manager", summary: "Reviewed opportunities", outcome: "Agreed a next meeting", next_steps: "" };
    expect(interactionInput.safeParse(valid).success).toBe(true);
    expect(interactionInput.safeParse({ ...valid, outcome: "" }).success).toBe(false);
    expect(interactionInput.safeParse({ ...valid, participants: "" }).success).toBe(false);
    expect(dateOnly.safeParse("2026-13-01").success).toBe(false);
  });
});