import { createClient } from "@/lib/supabase/server";

export type TrackappProfileFavorites = Readonly<{
  loggedIn: boolean;
  designIds: string[];
  appIds: string[];
  adsKeys: string[];
}>;

export async function getTrackappProfileFavorites(): Promise<TrackappProfileFavorites> {
  const sb = await createClient();
  if (!sb) return { loggedIn: false, designIds: [], appIds: [], adsKeys: [] };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { loggedIn: false, designIds: [], appIds: [], adsKeys: [] };

  const { data } = await sb
    .from("trackapp_profiles")
    .select("design_favorites, app_favorites, ads_favorites")
    .eq("id", user.id)
    .maybeSingle();

  const asStrings = (raw: unknown) =>
    Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];

  return {
    loggedIn: true,
    designIds: asStrings(data?.design_favorites),
    appIds: asStrings(data?.app_favorites),
    adsKeys: asStrings(data?.ads_favorites),
  };
}
