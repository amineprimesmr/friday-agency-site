import { TRACKAPP_APPTRACKER_PATH } from "@/lib/trackapp-tools-paths";

/** Fiches app workspace — `/trackapp/accueil/[id]`. */
export const TRACKAPP_ACCUEIL_BASE = "/trackapp/accueil";

/** Aperçu invité (landing) — sans compte ni abonnement. */
export const TRACKAPP_APERCU_BASE = "/trackapp/apercu";

/** Outil recherche App Store (barre de recherche). */
export const TRACKAPP_APPTRACKER_BASE = TRACKAPP_APPTRACKER_PATH;

/** Hub workspace après connexion / onboarding. */
export const TRACKAPP_WORKSPACE_HUB_PATH = TRACKAPP_APPTRACKER_PATH;

export const TRACKAPP_NOTRE_SELECTION_PATH = "/trackapp/notre-selection";

const APP_ID_PATTERN = /^\d{6,12}$/;

export function trackappApptrackerHref(options?: { country?: string; q?: string }): string {
  const params = new URLSearchParams();
  if (options?.country) params.set("country", options.country);
  if (options?.q?.trim()) params.set("q", options.q.trim());
  const qs = params.toString();
  return qs ? `${TRACKAPP_APPTRACKER_PATH}?${qs}` : TRACKAPP_APPTRACKER_PATH;
}

/** @deprecated Utiliser `trackappApptrackerHref`. */
export const trackappAccueilHref = trackappApptrackerHref;

/** Fiche app sous Accueil : `/trackapp/accueil/[id]`. */
export function trackappAccueilAppHref(appId: string, country: string): string {
  const params = new URLSearchParams({ country });
  return `${TRACKAPP_ACCUEIL_BASE}/${appId}?${params.toString()}`;
}

/** Aperçu invité : `/trackapp/apercu/[id]`. */
export function trackappApercuAppHref(appId: string, country: string): string {
  const params = new URLSearchParams({ country });
  return `${TRACKAPP_APERCU_BASE}/${appId}?${params.toString()}`;
}

/** Lien fiche selon accès premium (workspace vs aperçu invité). */
export function trackappAppDetailHref(
  appId: string,
  country: string,
  options?: { hasPremium?: boolean },
): string {
  if (options?.hasPremium) return trackappAccueilAppHref(appId, country);
  return trackappApercuAppHref(appId, country);
}

export function isTrackappApercuAppDetailPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  const prefix = `${TRACKAPP_APERCU_BASE}/`;
  if (!path.startsWith(prefix)) return false;
  const id = path.slice(prefix.length);
  return APP_ID_PATTERN.test(id);
}

export function trackappUnlockHref(appId: string, country: string): string {
  const next = trackappAccueilAppHref(appId, country);
  const params = new URLSearchParams({ next });
  return `/trackapp/paiement?${params.toString()}`;
}

export function trackappConnexionForAppHref(appId: string, country: string): string {
  const next = trackappAccueilAppHref(appId, country);
  const params = new URLSearchParams({ next });
  return `/trackapp/connexion?${params.toString()}`;
}

export const trackappApptrackerHubHref = trackappApptrackerHref;

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
