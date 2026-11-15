import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PartnerWork } from "./PartnerWork";
import { DIRECTORY } from "@/lib/directory";
import type { Followup, Interaction } from "@/lib/partner-work";

const store = vi.hoisted(() => ({ followups: [] as Followup[], interactions: [] as Interaction[] }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/partner-work.functions", () => ({
  getPartnerWork: async ({ data }: { data: { partnerId: string } }) => ({
    followups: store.followups.filter((row) => row.partner_id === data.partnerId),
    interactions: store.interactions.filter((row) => row.partner_id === data.partnerId),
    viewer: { userId: "test-user", name: "Test manager" },
  }),
  savePartnerFollowup: async ({ data }: { data: Partial<Followup> & { partnerId: string } }) => {
    const row = { ...data, id: data.id ?? "test-followup", partner_id: data.partnerId, created_at: "2026-11-15" } as Followup;
    store.followups = [...store.followups.filter((r) => r.id !== row.id), row];
    return { id: row.id };
  },
  recordPartnerInteraction: async ({ data }: { data: Partial<Interaction> & { partnerId: string } }) => {
    const row = { ...data, id: "test-interaction", partner_id: data.partnerId, recorded_by: "Test manager" } as Interaction;
    store.interactions.push(row);
    return { id: row.id };
  },
}));
afterEach(() => { cleanup(); store.followups = []; store.interactions = []; });

describe("partner work controls with a test-only record service", () => {
  it("creates, edits, completes and reopens a follow-up and records an interaction", async () => {
    const partner = DIRECTORY[0];
    if (!partner) throw new Error("A directory partner is required");
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><PartnerWork partner={partner} /></QueryClientProvider>);
    await waitFor(() => expect(screen.getByRole("button", { name: "Add Follow-up" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Add Follow-up" }));
    fireEvent.change(screen.getByLabelText("Next action"), { target: { value: "Confirm partner meeting" } });
    fireEvent.change(screen.getByLabelText("Owner", { exact: true }), { target: { value: "Manager A" } });
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2026-11-20" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Follow-up" }));
    await screen.findByText("Confirm partner meeting");
    fireEvent.click(screen.getByRole("button", { name: "Edit Confirm partner meeting" }));
    fireEvent.change(screen.getByLabelText("Next action"), { target: { value: "Review partner pipeline" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Follow-up" }));
    await screen.findByText("Review partner pipeline");
    fireEvent.click(screen.getByRole("button", { name: "Complete Review partner pipeline" }));
    await waitFor(() => expect(store.followups[0]?.status).toBe("Completed"));
    fireEvent.click(screen.getByRole("button", { name: /^Completed$/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Reopen Review partner pipeline" }));
    await waitFor(() => expect(store.followups[0]?.status).toBe("Open"));
    fireEvent.click(screen.getByRole("button", { name: "Log Interaction" }));
    fireEvent.change(screen.getByLabelText("Participants"), { target: { value: "Manager A, partner lead" } });
    fireEvent.change(screen.getByLabelText("Summary"), { target: { value: "Reviewed account coverage" } });
    fireEvent.change(screen.getByLabelText("Outcome"), { target: { value: "Partner agreed to a joint meeting" } });
    fireEvent.change(screen.getByLabelText("Agreed next steps"), { target: { value: "Confirm AE availability" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Interaction" }));
    await screen.findByText("Reviewed account coverage");
    expect(store.interactions[0]?.outcome).toBe("Partner agreed to a joint meeting");
    expect(store.interactions[0]?.next_steps).toBe("Confirm AE availability");
    expect(store.followups[0]?.partner_id).toBe(partner.id);
    client.clear();
  });
});