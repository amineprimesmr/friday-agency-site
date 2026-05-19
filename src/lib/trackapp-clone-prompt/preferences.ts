import type { TrackappPreferredIde } from "@/lib/trackapp-clone-prompt/types";

export const TRACKAPP_PREFERRED_IDE_STORAGE_KEY = "trackapp.preferredIde:v1";

export function readPreferredIde(): TrackappPreferredIde {
  if (typeof window === "undefined") return "cursor";
  try {
    const raw = localStorage.getItem(TRACKAPP_PREFERRED_IDE_STORAGE_KEY);
    return raw === "claude" ? "claude" : "cursor";
  } catch {
    return "cursor";
  }
}

export function writePreferredIde(ide: TrackappPreferredIde): void {
  try {
    localStorage.setItem(TRACKAPP_PREFERRED_IDE_STORAGE_KEY, ide);
  } catch {
    /* ignore quota / private mode */
  }
}
