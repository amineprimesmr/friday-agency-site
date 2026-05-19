/**
 * Meta Ad Library via Graph API `ads_archive`.
 * @see https://developers.facebook.com/docs/graph-api/reference/ads_archive/
 */

export type MetaArchivedAd = {
  id: string;
  ad_snapshot_url?: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_descriptions?: string[];
  page_name?: string;
  page_id?: string;
  publisher_platforms?: string[];
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
};

export type MetaAdLibraryResult = {
  data: MetaArchivedAd[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
    previous?: string;
  };
  /** Erreur métier Meta (token, quota, paramètres) */
  metaError?: { message: string; code?: number; type?: string };
};

const DEFAULT_GRAPH_VERSION = "v21.0";

const AD_FIELDS = [
  "id",
  "ad_snapshot_url",
  "ad_creative_bodies",
  "ad_creative_link_titles",
  "ad_creative_link_descriptions",
  "page_name",
  "page_id",
  "publisher_platforms",
  "ad_delivery_start_time",
  "ad_delivery_stop_time",
].join(",");

function normalizeCountries(input: string[]): string[] {
  const iso = input.map((c) => c.trim().toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c));
  return iso.length > 0 ? iso : ["FR"];
}

function normalizeSearchPageIds(raw: string[] | undefined): string[] {
  if (!raw?.length) return [];
  const out: string[] = [];
  for (const s of raw) {
    const id = String(s).trim();
    if (!/^\d+$/.test(id)) continue;
    if (out.includes(id)) continue;
    out.push(id);
    if (out.length >= 10) break;
  }
  return out;
}

/**
 * Appelle `GET /ads_archive` (serveur uniquement — token en env).
 *
 * - Mode **page** : `searchPageIds` (IDs Page Facebook numériques) → filtre Ad Library à la page / marque uniquement.
 * - Mode **mot-clé** : legacy interne uniquement. L'UI Trackapp envoie `page_only=1`.
 *
 * @see https://developers.facebook.com/docs/graph-api/reference/ads_archive/
 */
export async function fetchAdsArchive(params: {
  searchTerms?: string;
  /** Jusqu’à 10 IDs Page Facebook (chiffres uniquement, sans préfixe). */
  searchPageIds?: string[];
  countries: string[];
  limit?: number;
  after?: string;
}): Promise<MetaAdLibraryResult> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) {
    return { data: [], metaError: { message: "META_AD_LIBRARY_ACCESS_TOKEN non configuré" } };
  }

  const pageIds = normalizeSearchPageIds(params.searchPageIds);
  const q = (params.searchTerms ?? "").trim().slice(0, 100);

  if (pageIds.length === 0 && !q) {
    return { data: [], metaError: { message: "Fournis des searchPageIds ou un terme de recherche" } };
  }

  const version = process.env.META_GRAPH_API_VERSION?.trim() || DEFAULT_GRAPH_VERSION;
  const limit = Math.min(Math.max(params.limit ?? 12, 1), 50);
  const countries = normalizeCountries(params.countries);

  const url = new URL(`https://graph.facebook.com/${version}/ads_archive`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("ad_type", "ALL");
  url.searchParams.set("ad_active_status", "ACTIVE");
  url.searchParams.set("fields", AD_FIELDS);
  url.searchParams.set("limit", String(limit));
  /** Format JSON array attendu par Meta : ["US","FR"] */
  url.searchParams.set("ad_reached_countries", JSON.stringify(countries));

  if (pageIds.length > 0) {
    url.searchParams.set("search_page_ids", JSON.stringify(pageIds));
  } else {
    url.searchParams.set("search_terms", q);
    url.searchParams.set("search_type", "KEYWORD_UNORDERED");
  }

  if (params.after) {
    url.searchParams.set("after", params.after);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const json = (await res.json()) as MetaAdLibraryResult & {
    error?: { message: string; code?: number; type?: string };
  };

  if (!res.ok || json.error) {
    const err = json.error;
    return {
      data: [],
      metaError: {
        message: err?.message ?? `HTTP ${res.status}`,
        code: err?.code,
        type: err?.type,
      },
    };
  }

  return {
    data: Array.isArray(json.data) ? json.data : [],
    paging: json.paging,
  };
}

/**
 * URL web officielle Ad Library : filtre par **page** (`view_all_page_id`) si on a un ID Page Meta.
 */
export function metaAdLibraryWebUrl(params: { searchPageIds: string[]; keywordFallback: string }): string {
  const rawId = params.searchPageIds.find((id) => /^\d+$/.test(id));
  if (rawId) {
    const url = new URL("https://www.facebook.com/ads/library/");
    url.searchParams.set("active_status", "active");
    url.searchParams.set("ad_type", "all");
    url.searchParams.set("country", "ALL");
    url.searchParams.set("is_targeted_country", "false");
    url.searchParams.set("media_type", "all");
    url.searchParams.set("search_type", "page");
    url.searchParams.set("sort_data[direction]", "desc");
    url.searchParams.set("sort_data[mode]", "total_impressions");
    url.searchParams.set("view_all_page_id", rawId);
    return url.toString();
  }
  return "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&media_type=all";
}
