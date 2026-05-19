import { unstable_cache } from "next/cache";

import type { CountryCode } from "@/lib/apple-charts";

export type MetaAdLibraryCreative = {
  id: string;
  pageId: string;
  pageName: string;
  snapshotUrl: string;
  bodies: string[];
  linkTitles: string[];
  publisherPlatforms: string[];
  deliveryStart: string | null;
  deliveryStop: string | null;
};

export type MetaAdsLibraryFetchResult = {
  ok: boolean;
  pageId: string;
  pageName: string | null;
  ads: MetaAdLibraryCreative[];
  libraryUrl: string;
  error: string | null;
};

const AD_FIELDS = [
  "id",
  "page_id",
  "page_name",
  "ad_snapshot_url",
  "ad_creative_bodies",
  "ad_creative_link_titles",
  "publisher_platforms",
  "ad_delivery_start_time",
  "ad_delivery_stop_time",
].join(",");

const DEFAULT_LIMIT = 24;

function metaGraphVersion(): string {
  return process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
}

export function metaAdsLibraryViewerUrl(pageId: string): string {
  const url = new URL("https://www.facebook.com/ads/library/");
  url.searchParams.set("active_status", "active");
  url.searchParams.set("ad_type", "all");
  url.searchParams.set("country", "ALL");
  url.searchParams.set("is_targeted_country", "false");
  url.searchParams.set("media_type", "all");
  url.searchParams.set("search_type", "page");
  url.searchParams.set("sort_data[direction]", "desc");
  url.searchParams.set("sort_data[mode]", "total_impressions");
  url.searchParams.set("view_all_page_id", pageId);
  return url.toString();
}

function pickStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
}

function mapAdRow(raw: Record<string, unknown>): MetaAdLibraryCreative | null {
  const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "");
  const snapshotUrl = typeof raw.ad_snapshot_url === "string" ? raw.ad_snapshot_url.trim() : "";
  if (!id || !snapshotUrl) return null;

  return {
    id,
    pageId: typeof raw.page_id === "string" ? raw.page_id : String(raw.page_id ?? ""),
    pageName: typeof raw.page_name === "string" ? raw.page_name : "",
    snapshotUrl,
    bodies: pickStringList(raw.ad_creative_bodies),
    linkTitles: pickStringList(raw.ad_creative_link_titles),
    publisherPlatforms: pickStringList(raw.publisher_platforms),
    deliveryStart: typeof raw.ad_delivery_start_time === "string" ? raw.ad_delivery_start_time : null,
    deliveryStop: typeof raw.ad_delivery_stop_time === "string" ? raw.ad_delivery_stop_time : null,
  };
}

function formatGraphError(json: unknown): string {
  if (!json || typeof json !== "object") return "réponse Meta invalide";
  const err = (json as { error?: { message?: string; error_user_msg?: string } }).error;
  const msg = err?.error_user_msg || err?.message;
  return msg?.trim() || "erreur Meta Ad Library API";
}

export function isMetaAdsLibraryConfigured(): boolean {
  return Boolean(process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim());
}

/** Pays ISO pour ad_reached_countries (requis par l’API). */
export function metaAdReachedCountry(country: CountryCode): string {
  return country.toUpperCase();
}

export async function fetchMetaAdsForPage(
  pageId: string,
  country: CountryCode,
  limit = DEFAULT_LIMIT,
): Promise<MetaAdsLibraryFetchResult> {
  const trimmedPageId = pageId.trim();
  const libraryUrl = metaAdsLibraryViewerUrl(trimmedPageId);
  const empty = (error: string | null): MetaAdsLibraryFetchResult => ({
    ok: false,
    pageId: trimmedPageId,
    pageName: null,
    ads: [],
    libraryUrl,
    error,
  });

  if (!/^\d{6,24}$/.test(trimmedPageId)) {
    return empty("Page ID Meta invalide");
  }

  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) {
    return empty("META_AD_LIBRARY_ACCESS_TOKEN non configuré sur le serveur");
  }

  const reached = metaAdReachedCountry(country);
  const u = new URL(`https://graph.facebook.com/${metaGraphVersion()}/ads_archive`);
  u.searchParams.set("access_token", token);
  u.searchParams.set("search_page_ids", `['${trimmedPageId}']`);
  u.searchParams.set("ad_reached_countries", `['${reached}']`);
  u.searchParams.set("ad_active_status", "ALL");
  u.searchParams.set("ad_type", "ALL");
  u.searchParams.set("fields", AD_FIELDS);
  u.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 50)));

  try {
    const res = await fetch(u.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      data?: Record<string, unknown>[];
      error?: { message?: string; error_user_msg?: string };
    };

    if (!res.ok || json.error) {
      return empty(formatGraphError(json));
    }

    const ads = (Array.isArray(json.data) ? json.data : [])
      .map((row) => mapAdRow(row))
      .filter((row): row is MetaAdLibraryCreative => row !== null);

    const pageName = ads[0]?.pageName || null;

    return {
      ok: true,
      pageId: trimmedPageId,
      pageName,
      ads,
      libraryUrl,
      error: null,
    };
  } catch {
    return empty("impossible de joindre la Meta Ad Library API");
  }
}

export const fetchMetaAdsForPageCached = (
  pageId: string,
  country: CountryCode,
  limit = DEFAULT_LIMIT,
) =>
  unstable_cache(
    async () => fetchMetaAdsForPage(pageId, country, limit),
    ["meta-ads-page-v1", pageId, country, String(limit), isMetaAdsLibraryConfigured() ? "on" : "off"],
    { revalidate: 60 * 60 * 6 },
  )();
