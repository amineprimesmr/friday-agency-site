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
  return iso.length > 0 ? iso : ["US"];
}

/**
 * Appelle `GET /ads_archive` (serveur uniquement — token en env).
 */
export async function fetchAdsArchive(params: {
  searchTerms: string;
  countries: string[];
  limit?: number;
  after?: string;
}): Promise<MetaAdLibraryResult> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) {
    return { data: [], metaError: { message: "META_AD_LIBRARY_ACCESS_TOKEN non configuré" } };
  }

  const q = params.searchTerms.trim().slice(0, 100);
  if (!q) {
    return { data: [], metaError: { message: "Terme de recherche vide" } };
  }

  const version = process.env.META_GRAPH_API_VERSION?.trim() || DEFAULT_GRAPH_VERSION;
  const limit = Math.min(Math.max(params.limit ?? 12, 1), 50);
  const countries = normalizeCountries(params.countries);

  const url = new URL(`https://graph.facebook.com/${version}/ads_archive`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("search_terms", q);
  url.searchParams.set("search_type", "KEYWORD_UNORDERED");
  url.searchParams.set("ad_type", "ALL");
  url.searchParams.set("ad_active_status", "ACTIVE");
  url.searchParams.set("fields", AD_FIELDS);
  url.searchParams.set("limit", String(limit));
  /** Format JSON array attendu par Meta : ["US","FR"] */
  url.searchParams.set("ad_reached_countries", JSON.stringify(countries));

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
