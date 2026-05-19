import type { TrackappCloneAngle, TrackappCloneStack } from "@/lib/trackapp-clone-prompt/types";

export const TRACKAPP_CREER_DEPUIS_APP_BASE = "/trackapp/creer-depuis-app";

export function trackappCreerDepuisAppHref(
  appId: string,
  country: string,
  options?: { stack?: TrackappCloneStack; angle?: TrackappCloneAngle },
): string {
  const params = new URLSearchParams({ country });
  if (options?.stack) params.set("stack", options.stack);
  if (options?.angle) params.set("angle", options.angle);
  return `${TRACKAPP_CREER_DEPUIS_APP_BASE}/${appId}?${params.toString()}`;
}

export function isTrackappCreerDepuisAppPath(pathname: string): boolean {
  return pathname.startsWith(`${TRACKAPP_CREER_DEPUIS_APP_BASE}/`);
}
