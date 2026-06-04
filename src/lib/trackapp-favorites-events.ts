export const TRACKAPP_FAVORITES_CHANGED = "trackapp:favorites-changed";
export const TRACKAPP_SIDEBAR_FAVORITES_REFRESH = "trackapp:sidebar-favorites-refresh";

export type TrackappFavoriteAppMeta = Readonly<{
  id: string;
  name: string;
  artworkUrl: string | null;
}>;

export type TrackappFavoritesChangedDetail = Readonly<{
  appId: string;
  favorite: boolean;
  app?: TrackappFavoriteAppMeta;
}>;

export function dispatchTrackappFavoritesChanged(detail: TrackappFavoritesChangedDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRACKAPP_FAVORITES_CHANGED, { detail }));
}

export function dispatchTrackappSidebarFavoritesRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRACKAPP_SIDEBAR_FAVORITES_REFRESH));
}
