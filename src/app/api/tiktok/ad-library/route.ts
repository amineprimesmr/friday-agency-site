import { NextResponse } from "next/server";
import { queryTikTokAdLibrary } from "@/lib/tiktok-ad-library";

/**
 * GET /api/tiktok/ad-library?q=...&country=US&limit=12&search_id=...
 * Proxy serveur vers TikTok Research API — Ad Library (client_key + client_secret en env).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "US";
  const limitRaw = searchParams.get("limit");
  const searchId = searchParams.get("search_id") ?? undefined;

  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 12;

  const configured = Boolean(
    process.env.TIKTOK_CLIENT_KEY?.trim() && process.env.TIKTOK_CLIENT_SECRET?.trim(),
  );

  const result = await queryTikTokAdLibrary({
    searchTerm: q,
    countryCode: country.trim().toUpperCase() || "US",
    maxCount: Number.isFinite(limit) ? limit : 12,
    searchId,
  });

  return NextResponse.json({
    configured,
    searchQuery: q.slice(0, 50),
    country: country.trim().toUpperCase() || "US",
    ads: result.ads,
    hasMore: result.hasMore,
    searchId: result.searchId,
    error: result.tiktokError?.message ?? null,
    errorCode: result.tiktokError?.code ?? null,
    logId: result.tiktokError?.logId ?? null,
  });
}
