/**
 * Résolution d’ID Page Facebook (Graph) à partir d’URL ou d’identifiant,
 * pour enchaîner sur Ad Library `search_page_ids`.
 */

const SKIP_PATH_PREFIXES = new Set([
  "share",
  "sharer",
  "dialog",
  "login",
  "watch",
  "groups",
  "events",
  "photo.php",
  "story.php",
  "permalink.php",
  "video.php",
  "marketplace",
  "gaming",
  "reel",
  "stories",
  "l.php",
  "privacy",
  "ads",
  "business",
]);

/**
 * Extrait un identifiant utilisable dans `GET /{id-or-username}` (Graph).
 * Préfère l’ID numérique ; supporte aussi la Bibliothèque publicitaire (`view_all_page_id`).
 */
export function facebookGraphIdentifierFromUrl(urlString: string): string | null {
  let u: URL;
  try {
    u = new URL(urlString.trim());
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./i, "").toLowerCase();
  if (!host.endsWith("facebook.com") && host !== "fb.com" && !host.endsWith(".facebook.com")) {
    return null;
  }

  const viewAll = u.searchParams.get("view_all_page_id")?.trim();
  if (viewAll && /^\d+$/.test(viewAll)) return viewAll;

  const searchPageRaw = u.searchParams.get("search_page_ids")?.trim();
  if (searchPageRaw) {
    try {
      const arr = JSON.parse(searchPageRaw) as unknown;
      if (Array.isArray(arr) && arr.length > 0) {
        const first = String(arr[0]).trim();
        if (/^\d+$/.test(first)) return first;
      }
    } catch {
      /* ignore invalid JSON */
    }
  }

  const idParam = u.searchParams.get("id")?.trim();
  if (idParam && /^\d+$/.test(idParam)) return idParam;

  const parts = u.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts[0] && SKIP_PATH_PREFIXES.has(parts[0])) return null;

  if (parts[0] === "profile.php") {
    return idParam && /^\d+$/.test(idParam) ? idParam : null;
  }

  const last = parts[parts.length - 1]!;
  if (/^\d+$/.test(last)) return last;

  if (parts[0] === "pages" && parts.length >= 2) {
    const tail = parts[parts.length - 1]!;
    if (/^\d+$/.test(tail)) return tail;
    return parts[1]!;
  }

  return parts[0]!;
}

export type ResolvedFacebookPage = { id: string; name?: string };

/**
 * `GET /{page-id-or-username}?fields=id,name` — même jeton Ad Library / app souvent suffisant pour les pages publiques.
 */
export async function resolveFacebookPageNode(
  accessToken: string,
  identifier: string,
): Promise<ResolvedFacebookPage | null> {
  const token = accessToken.trim();
  if (!token || !identifier.trim()) return null;

  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
  const enc = encodeURIComponent(identifier.trim());
  const u = new URL(`https://graph.facebook.com/${version}/${enc}`);
  u.searchParams.set("access_token", token);
  u.searchParams.set("fields", "id,name");

  const res = await fetch(u.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const json = (await res.json()) as {
    id?: string;
    name?: string;
    error?: { message?: string };
  };

  if (!res.ok || json.error || !json.id || !/^\d+$/.test(json.id)) {
    return null;
  }

  return { id: json.id, name: typeof json.name === "string" ? json.name : undefined };
}
