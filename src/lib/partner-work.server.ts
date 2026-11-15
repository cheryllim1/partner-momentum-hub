import { createClient } from "@supabase/supabase-js";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { getEnv, getSessionUser } from "./auth.server";
import { DIRECTORY } from "./directory";

export async function partnerWorkAccess(partnerId: string) {
  setResponseHeader("Cache-Control", "private, no-store");
  const user = await getSessionUser();
  if (!user) throw new Error("Open this partner page while signed in to Lovable to view and save shared records.");
  if (!DIRECTORY.some((p) => p.id === partnerId)) throw new Error("Partner not found.");
  const token = getRequest().headers.get("x-lovable-identity-token");
  if (!token) throw new Error("Your Lovable session is unavailable.");
  const env = await getEnv();
  const url = env["SUPABASE_URL"];
  const key = env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Shared partner records are temporarily unavailable.");
  const db = createClient(url, key, {
    accessToken: async () => token,
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { user, db };
}