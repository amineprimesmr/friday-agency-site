import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

export async function getTrackappDesignFavoriteIds(): Promise<{ loggedIn: boolean; favoriteIds: string[] }> {
  const p = await getTrackappProfileFavorites();
  return { loggedIn: p.loggedIn, favoriteIds: p.designIds };
}
