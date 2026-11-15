import { createServerFn } from "@tanstack/react-start";
import { followupInput, interactionInput, partnerWorkKey, type Followup, type Interaction } from "./partner-work";

export const getPartnerWork = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => partnerWorkKey.parse(data))
  .handler(async ({ data }) => {
    const { partnerWorkAccess } = await import("./partner-work.server");
    const { db, user } = await partnerWorkAccess(data.partnerId);
    const [followups, interactions] = await Promise.all([
      db.from("partner_followups").select("*").eq("partner_id", data.partnerId).order("due_date"),
      db.from("partner_interactions").select("*").eq("partner_id", data.partnerId).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    if (followups.error || interactions.error) throw new Error("Unable to load shared records. Please retry.");
    return { followups: followups.data as Followup[], interactions: interactions.data as Interaction[], viewer: { userId: user.userId, name: user.displayName } };
  });

export const savePartnerFollowup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => followupInput.parse(data))
  .handler(async ({ data }) => {
    const { partnerWorkAccess } = await import("./partner-work.server");
    const { db, user } = await partnerWorkAccess(data.partnerId);
    const { partnerId, id, ...fields } = data;
    const result = id
      ? await db.from("partner_followups").update({ ...fields, updated_by: user.userId }).eq("id", id).eq("partner_id", partnerId).select("id").single()
      : await db.from("partner_followups").insert({ ...fields, partner_id: partnerId, created_by: user.userId, updated_by: user.userId }).select("id").single();
    if (result.error) throw new Error("Unable to save this follow-up. Please retry.");
    return { id: result.data.id as string };
  });

export const recordPartnerInteraction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => interactionInput.parse(data))
  .handler(async ({ data }) => {
    const { partnerWorkAccess } = await import("./partner-work.server");
    const { db, user } = await partnerWorkAccess(data.partnerId);
    const { partnerId, ...fields } = data;
    const result = await db.from("partner_interactions").insert({ ...fields, partner_id: partnerId,
      created_by: user.userId, recorded_by: user.displayName ?? "Project member" }).select("id").single();
    if (result.error) throw new Error("Unable to record this interaction. Please retry.");
    return { id: result.data.id as string };
  });