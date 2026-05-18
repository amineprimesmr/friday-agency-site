import { createClient } from "@/lib/supabase/server";

export async function getTrackappDesignFavoriteIds(): Promise<{ loggedIn: boolean; favoriteIds: string[] }> {
  const sb = await createClient();
  if (!sb) return { loggedIn: false, favoriteIds: [] };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { loggedIn: false, favoriteIds: [] };

  const { data } = await sb.from("trackapp_profiles").select("design_favorites").eq("id", user.id).maybeSingle();

  const raw = data?.design_favorites;
  const favoriteIds = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];

  return { loggedIn: true, favoriteIds };
}
