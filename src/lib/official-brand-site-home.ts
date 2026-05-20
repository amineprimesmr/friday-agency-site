/** Évite d’exposer /terms, /privacy, etc. comme « site officiel » — renvoie la home du domaine. */

function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
}

export function cleanOfficialSiteUrl(url: URL): string {
  const copy = new URL(url.toString());
  copy.hash = "";
  return copy.toString();
}

function pathSegments(pathname: string): string[] {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s).toLowerCase().replace(/_/g, "-"));
}

function segmentLooksLegal(slug: string): boolean {
  if (
    /^(terms|privacy|legal|cgu|cgv|cookies?|gdpr|eula|imprint|impressum|policy|policies|confidentialite|conditions|mentions-legales|faq)(-|$)/.test(
      slug,
    )
  ) {
    return true;
  }
  if (/terms[-_]?of[-_]?(service|use)/.test(slug)) return true;
  if (/privacy[-_]?policy/.test(slug)) return true;
  if (/conditions[-_]?(generales|générales|utilisation|service)/.test(slug)) return true;
  if (/politique[-_]?(de[-_])?confidentialite/.test(slug)) return true;
  if (slug === "tos" || slug === "pp" || slug === "terms-of-service" || slug === "terms-of-use") {
    return true;
  }
  return false;
}

/** true si le chemin ressemble à CGU, confidentialité, cookies, etc. */
export function isLegalOrPolicySitePath(pathname: string): boolean {
  const segs = pathSegments(pathname);
  if (segs.length === 0) return false;
  return segs.some((seg) => segmentLooksLegal(seg));
}

function isLocaleSegment(seg: string): boolean {
  return /^[a-z]{2}(-[a-z]{2})?$/i.test(seg);
}

/**
 * Ramène une URL « site » vers la landing (racine ou /fr/), jamais une page légale.
 */
export function resolveOfficialSiteHomeUrl(input: string | URL): string | null {
  const url = typeof input === "string" ? parseUrl(input) : input;
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return null;

  if (!isLegalOrPolicySitePath(url.pathname)) {
    return cleanOfficialSiteUrl(url);
  }

  const segs = pathSegments(url.pathname);
  const first = segs[0];
  if (first && isLocaleSegment(first) && segs.length >= 2) {
    return cleanOfficialSiteUrl(new URL(`/${first}/`, url.origin));
  }

  return cleanOfficialSiteUrl(new URL("/", url.origin));
}

/** Plus haut = meilleur candidat « site marketing » depuis la fiche App Store. */
export function scoreOfficialSiteCandidate(url: URL): number {
  if (isLegalOrPolicySitePath(url.pathname)) return 5;

  const segs = pathSegments(url.pathname);
  if (segs.length === 0) return 100;
  if (segs.length === 1 && isLocaleSegment(segs[0]!)) return 95;

  const head = segs[0]!;
  if (["about", "a-propos", "company", "pricing", "download", "app", "product"].includes(head)) {
    return 45;
  }
  if (["support", "help", "faq", "contact", "assistance"].includes(head)) {
    return 20;
  }
  return 30;
}
