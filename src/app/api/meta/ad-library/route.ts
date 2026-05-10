import { NextResponse } from "next/server";
import { fetchAdsArchive } from "@/lib/meta-ad-library";

/**
 * GET /api/meta/ad-library?q=...&countries=us,fr&limit=12&after=cursor
 * Proxy sécurisé vers Meta Graph `ads_archive` (token uniquement côté serveur).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const countriesParam = searchParams.get("countries") ?? "US";
  const limitRaw = searchParams.get("limit");
  const after = searchParams.get("after") ?? undefined;

  const countries = countriesParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 12;

  const configured = Boolean(process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim());

  const result = await fetchAdsArchive({
    searchTerms: q,
    countries,
    limit: Number.isFinite(limit) ? limit : 12,
    after,
  });

  return NextResponse.json({
    configured,
    searchQuery: q.slice(0, 100),
    countries: countries.length ? countries.map((c) => c.toUpperCase()) : ["US"],
    ads: result.data,
    paging: result.paging ?? null,
    error: result.metaError?.message ?? null,
    errorCode: result.metaError?.code ?? null,
  });
}
