/** Recherche / landing workspace Trackapp. */
export const TRACKAPP_ACCUEIL_BASE = "/trackapp/accueil";

/** Fiches app (détail) — pas de page liste sur cette URL (redirige vers Accueil). */
export const TRACKAPP_APPTRACKER_BASE = "/trackapp/apptracker";

export const TRACKAPP_NOTRE_SELECTION_PATH = "/trackapp/notre-selection";

export function trackappAccueilHref(options?: { country?: string; q?: string }): string {
  const params = new URLSearchParams();
  if (options?.country) params.set("country", options.country);
  if (options?.q?.trim()) params.set("q", options.q.trim());
  const qs = params.toString();
  return qs ? `${TRACKAPP_ACCUEIL_BASE}?${qs}` : TRACKAPP_ACCUEIL_BASE;
}

/** @deprecated Préférer `trackappAccueilHref`. */
export const trackappApptrackerHubHref = trackappAccueilHref;

export function trackappApptrackerAppHref(appId: string, country: string): string {
  const params = new URLSearchParams({ country });
  return `${TRACKAPP_APPTRACKER_BASE}/${appId}?${params.toString()}`;
}

export function isTrackappApptrackerDetailPath(pathname: string): boolean {
  return pathname.startsWith(`${TRACKAPP_APPTRACKER_BASE}/`);
}
