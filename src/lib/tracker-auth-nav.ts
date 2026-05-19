/** Liens Connexion / Mon espace pour la nav publique Tracker. */
export const TRACKER_WORKSPACE_HREF = "/trackapp/accueil";

export const TRACKER_CONNEXION_HREF = `/trackapp/connexion?next=${encodeURIComponent(TRACKER_WORKSPACE_HREF)}`;

const TRACKAPP_PUBLIC_PREFIXES = [
  "/trackapp/connexion",
  "/trackapp/inscription",
  "/trackapp/paiement",
  "/trackapp/onboarding",
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
    if (pathname === "/trackapp" || !pathname.startsWith("/trackapp/")) return false;
    return !TRACKAPP_PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  if (href.startsWith("/trackapp/connexion")) {
    return pathname === "/trackapp/connexion" || pathname.startsWith("/trackapp/connexion/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
