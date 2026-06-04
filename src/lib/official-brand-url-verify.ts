type VerifyPlatform =
  | "site"
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "threads"
  | "metaAdsLibrary";

export type UrlVerifyResult = {
  ok: boolean;
  reason: string;
  httpStatus: number | null;
};

const ERROR_MARKERS: Partial<Record<VerifyPlatform, string[]>> = {
  youtube: [
    "this page isn't available",
    "page isn't available",
    "cette page est inaccessible",
    "didn't find the channel",
    "cette chaîne n'existe pas",
    "channel does not exist",
  ],
  x: [
    "this account doesn't exist",
    "account doesn't exist",
    "ce compte n'existe pas",
    "doesn't exist",
    "something went wrong. try reloading",
  ],
  facebook: [
    "ce contenu n'est pas disponible",
    "content isn't available",
    "this content isn't available",
    "page not found",
    "the link you followed may be broken",
  ],
  tiktok: [
    "couldn't find this account",
    "could not find this account",
    "compte est introuvable",
    "ce compte est introuvable",
    "user not found",
  ],
  instagram: [
    "sorry, this page isn't available",
    "page isn't available",
    "cette page n'est pas disponible",
  ],
  linkedin: [
    "page not found",
    "cette page n'existe pas",
    "this page doesn't exist",
  ],
};

function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
}

function htmlIndicatesError(platform: VerifyPlatform, sampleLower: string): boolean {
  const markers = ERROR_MARKERS[platform];
  if (!markers?.length) return false;
  return markers.some((m) => sampleLower.includes(m));
}

/** Vérifie qu'une URL existe (HTTP) et n'est pas une page d'erreur connue (404 soft). */
export async function verifyOutboundUrl(
  urlString: string,
  platform?: VerifyPlatform,
): Promise<UrlVerifyResult> {
  const url = parseUrl(urlString);
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) {
    return { ok: false, reason: "URL invalide", httpStatus: null };
  }

  if (platform === "metaAdsLibrary") {
    const pageId = url.searchParams.get("view_all_page_id")?.trim();
    const searchType = url.searchParams.get("search_type");
    if (url.searchParams.get("q")?.trim()) {
      return { ok: false, reason: "Meta Ads : recherche par mot-clé interdite", httpStatus: null };
    }
    if (searchType === "keyword_unordered" || searchType === "keyword") {
      return { ok: false, reason: "Meta Ads : search_type keyword interdit", httpStatus: null };
    }
    if (!pageId || !/^\d{6,24}$/.test(pageId)) {
      return { ok: false, reason: "Meta Ads : view_all_page_id manquant ou invalide", httpStatus: null };
    }
  }

  try {
    const res = await fetch(urlString, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; TrackappOSINT/1.0; +https://trackapp.fr) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(14_000),
      cache: "no-store",
    });

    const status = res.status;

    if (status === 404 || status === 410) {
      return { ok: false, reason: `HTTP ${status} — page introuvable`, httpStatus: status };
    }

    if (status === 403) {
      if (platform === "instagram" || platform === "tiktok") {
        return {
          ok: true,
          reason: "HTTP 403 (mur anti-bot) — profil supposé actif",
          httpStatus: status,
        };
      }
      return {
        ok: false,
        reason: "HTTP 403 — accès refusé, impossible de confirmer le compte officiel",
        httpStatus: status,
      };
    }

    if (status >= 500) {
      return { ok: false, reason: `HTTP ${status} — serveur indisponible`, httpStatus: status };
    }

    if (!res.ok) {
      return { ok: false, reason: `HTTP ${status}`, httpStatus: status };
    }

    const ctype = (res.headers.get("content-type") ?? "").toLowerCase();
    if (platform && ctype.includes("text/html")) {
      const text = (await res.text()).slice(0, 80_000).toLowerCase();
      if (htmlIndicatesError(platform, text)) {
        return {
          ok: false,
          reason: "page d'erreur détectée (compte ou contenu introuvable)",
          httpStatus: status,
        };
      }
    }

    return { ok: true, reason: "URL accessible et vérifiable", httpStatus: status };
  } catch {
    return { ok: false, reason: "échec de la vérification HTTP", httpStatus: null };
  }
}

/** L'URL doit être citée dans les sources web OpenAI (anti-hallucination). */
export function urlHasWebEvidence(urlString: string, sources: string[]): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const path = url.pathname.replace(/\/$/, "").toLowerCase();
  const needle = `${host}${path}`;

  if (
    sources.some((raw) => {
      const s = parseUrl(raw);
      if (!s) return false;
      const sh = s.hostname.replace(/^www\./i, "").toLowerCase();
      const sp = s.pathname.replace(/\/$/, "").toLowerCase();
      const hay = `${sh}${sp}`;
      return hay === needle || hay.includes(needle) || needle.includes(hay);
    })
  ) {
    return true;
  }

  return urlHasSocialHandleEvidence(urlString, sources);
}

/** Match par handle (instagram.com/duolingo) même si la source a des query params. */
function urlHasSocialHandleEvidence(urlString: string, sources: string[]): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  const handle = parts[0]?.replace(/^@/, "").toLowerCase();
  if (!handle || handle.length < 3) return false;

  const profileHosts: Record<string, string[]> = {
    "instagram.com": ["instagram.com"],
    "instagr.am": ["instagram.com"],
    "tiktok.com": ["tiktok.com"],
    "x.com": ["x.com", "twitter.com"],
    "twitter.com": ["x.com", "twitter.com"],
    "youtube.com": ["youtube.com"],
    "facebook.com": ["facebook.com"],
    "linkedin.com": ["linkedin.com"],
    "threads.net": ["threads.net"],
  };

  const aliases = profileHosts[host];
  if (!aliases) return false;

  return sources.some((raw) => {
    const s = parseUrl(raw);
    if (!s) return false;
    const sh = s.hostname.replace(/^www\./i, "").toLowerCase();
    if (!aliases.some((a) => sh === a || sh.endsWith(`.${a}`))) return false;
    const sp = s.pathname.split("/").filter(Boolean);
    const shandle = sp[0]?.replace(/^@/, "").toLowerCase();
    return shandle === handle;
  });
}
