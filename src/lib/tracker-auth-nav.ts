import { TRACKAPP_LANDING_PATH, trackappConnexionNextHref } from "@/lib/trackapp-landing-paths";

/** Liens Connexion / Mon espace pour la nav publique Tracker. */
export const TRACKER_WORKSPACE_HREF = TRACKAPP_LANDING_PATH;

export const TRACKER_CONNEXION_HREF = trackappConnexionNextHref(TRACKAPP_LANDING_PATH);

const TRACKAPP_PUBLIC_PREFIXES = [
  "/trackapp/connexion",
  "/trackapp/inscription",
  "/trackapp/paiement",
  "/trackapp/mot-de-passe-oublie",
  "/trackapp/auth",
  "/trackapp/deconnexion",
  "/trackapp/legal",
] as const;

export function trackerAuthNavItem(loggedIn: boolean) {
  return loggedIn
    ? { href: TRACKER_WORKSPACE_HREF, label: "Mon espace" as const }
    : { href: TRACKER_CONNEXION_HREF, label: "Connexion" as const };
}

export function trackerAuthNavActive(pathname: string, href: string): boolean {
  if (href === TRACKER_WORKSPACE_HREF) {
    if (!pathname.startsWith("/trackapp/")) return false;
    if (pathname === TRACKAPP_LANDING_PATH || pathname.startsWith(`${TRACKAPP_LANDING_PATH}?`)) {
      return true;
    }
    return !TRACKAPP_PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  if (href.startsWith("/trackapp/connexion")) {
    return pathname === "/trackapp/connexion" || pathname.startsWith("/trackapp/connexion/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
