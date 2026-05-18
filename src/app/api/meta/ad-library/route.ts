import { NextResponse } from "next/server";
import { fetchAdsArchive } from "@/lib/meta-ad-library";

/**
 * GET /api/meta/ad-library?q=...&page_ids=id1,id2&page_only=1&countries=fr,gb&limit=12&after=cursor
 * Proxy sécurisé vers Meta Graph `ads_archive` (token uniquement côté serveur).
 *
 * Si `page_ids` est fourni, Meta retourne les annonces **de cette page uniquement** (`search_page_ids`).
 * `page_only=1` bloque explicitement le fallback mot-clé utilisé par l'ancien flux.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const pageIdsRaw = searchParams.get("page_ids") ?? "";
  const pageOnly = searchParams.get("page_only") === "1";
  const countriesParam = searchParams.get("countries") ?? "US";
  const limitRaw = searchParams.get("limit");
  const after = searchParams.get("after") ?? undefined;

  const countries = countriesParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 12;

  const configured = Boolean(process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim());

  const pageIds = pageIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .slice(0, 10);

  if (pageOnly && pageIds.length === 0) {
    return NextResponse.json({
      configured,
      searchQuery: q.slice(0, 100),
      searchPageIds: [],
      searchMode: "keyword",
      countries: countries.length ? countries.map((c) => c.toUpperCase()) : ["FR"],
      ads: [],
      paging: null,
      error: "Page Meta officielle requise: recherche mot-clé désactivée pour la Librairie Ads.",
      errorCode: null,
    });
  }

  const result =
    pageIds.length > 0
      ? await fetchAdsArchive({
          searchPageIds: pageIds,
          countries,
          limit: Number.isFinite(limit) ? limit : 12,
          after,
        })
      : await fetchAdsArchive({
          searchTerms: q,
          countries,
          limit: Number.isFinite(limit) ? limit : 12,
          after,
        });

  return NextResponse.json({
    configured,
    searchQuery: q.slice(0, 100),
    searchPageIds: pageIds,
    searchMode: pageIds.length > 0 ? "page" : "keyword",
    countries: countries.length ? countries.map((c) => c.toUpperCase()) : ["FR"],
    ads: result.data,
    paging: result.paging ?? null,
    error: result.metaError?.message ?? null,
    errorCode: result.metaError?.code ?? null,
  });
}
