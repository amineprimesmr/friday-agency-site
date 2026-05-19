import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

import { normalizeTrackerCountryParam, searchApps, type CountryCode } from "@/lib/apple-charts";
import { enrichSearchResultsWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";

const cachedSearch = unstable_cache(
  async (q: string, country: CountryCode, limit: number) => searchApps(q, country, limit),
  ["trackapp-search-api-v1"],
  { revalidate: 300 },
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country"));
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "24") || 24, 1), 25);

  if (!q) {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }

  try {
    const raw = await cachedSearch(q, country, limit);
    const apps = await enrichSearchResultsWithTrackappMetrics(raw, country);
    return NextResponse.json(
      { apps },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }
}
