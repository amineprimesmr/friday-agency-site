import { cache } from "react";

import { loadProfileFavorites } from "@/lib/trackapp-profile-favorites-store";
import { getTrackappUser } from "@/lib/supabase/get-trackapp-user";

export type TrackappProfileFavorites = Readonly<{
  loggedIn: boolean;
  designIds: string[];
  appIds: string[];
  adsKeys: string[];
  storageError: string | null;
}>;

export const getTrackappProfileFavorites = cache(async (): Promise<TrackappProfileFavorites> => {
  const empty: TrackappProfileFavorites = {
    loggedIn: false,
    designIds: [],
    appIds: [],
    adsKeys: [],
    storageError: null,
  };

  const { sb, user } = await getTrackappUser();
  if (!sb || !user) return empty;

  const loaded = await loadProfileFavorites(sb, user.id);
  return {
    loggedIn: true,
    designIds: loaded.designIds,
    appIds: loaded.appIds,
    adsKeys: loaded.adsKeys,
    storageError: loaded.storageError,
  };
});
