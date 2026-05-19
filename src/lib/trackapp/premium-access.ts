import { createAdminClient } from "@/lib/supabase/admin";

export async function userHasTrackappPremium(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { data } = await admin
    .from("trackapp_profiles")
    .select("plan_unlocked_at")
    .eq("id", userId)
    .maybeSingle();

  return Boolean(data?.plan_unlocked_at);
}
