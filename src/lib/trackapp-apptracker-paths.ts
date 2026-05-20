/** Recherche workspace Trackapp. */
export const TRACKAPP_ACCUEIL_BASE = "/trackapp/accueil";

/** @deprecated Ancienne base fiche — redirigée vers Accueil. */
export const TRACKAPP_APPTRACKER_BASE = "/trackapp/apptracker";

export const TRACKAPP_NOTRE_SELECTION_PATH = "/trackapp/notre-selection";

const APP_ID_PATTERN = /^\d{6,12}$/;

export function trackappAccueilHref(options?: { country?: string; q?: string }): string {
  const params = new URLSearchParams();
  if (options?.country) params.set("country", options.country);
  if (options?.q?.trim()) params.set("q", options.q.trim());
  const qs = params.toString();
  return qs ? `${TRACKAPP_ACCUEIL_BASE}?${qs}` : TRACKAPP_ACCUEIL_BASE;
}

/** Fiche app sous Accueil : `/trackapp/accueil/[id]`. */
export function trackappAccueilAppHref(appId: string, country: string): string {
  const params = new URLSearchParams({ country });
  return `${TRACKAPP_ACCUEIL_BASE}/${appId}?${params.toString()}`;
}

/** @deprecated Utiliser `trackappAccueilAppHref`. */
export const trackappApptrackerHubHref = trackappAccueilHref;

/** @deprecated Utiliser `trackappAccueilAppHref`. */
export const trackappApptrackerAppHref = trackappAccueilAppHref;

export function isTrackappAccueilAppDetailPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  const prefix = `${TRACKAPP_ACCUEIL_BASE}/`;
  if (!path.startsWith(prefix)) return false;
  const id = path.slice(prefix.length);
  return APP_ID_PATTERN.test(id);
}

/** @deprecated Utiliser `isTrackappAccueilAppDetailPath`. */
export function isTrackappApptrackerDetailPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  if (isTrackappAccueilAppDetailPath(path)) return true;
  const prefix = `${TRACKAPP_APPTRACKER_BASE}/`;
  if (!path.startsWith(prefix)) return false;
  const id = path.slice(prefix.length);
  return APP_ID_PATTERN.test(id);
}
