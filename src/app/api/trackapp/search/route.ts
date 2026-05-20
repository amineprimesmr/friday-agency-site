import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { runTrackappSmartSearch } from "@/lib/trackapp-smart-search/run-smart-search";
import type { TrackappSearchSort } from "@/lib/trackapp-smart-search/rank-results";

function parseSort(raw: string | null): TrackappSearchSort {
  const s = (raw ?? "").trim().toLowerCase();
  if (s === "revenue" || s === "downloads" || s === "rating" || s === "relevance") return s;
  return "relevance";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country"));
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "24") || 24, 1), 40);
  const sort = parseSort(searchParams.get("sort"));

  if (!q) {
    return NextResponse.json({ apps: [], queriesUsed: [], sort, expanded: false }, { status: 200 });
  }

  try {
    const result = await runTrackappSmartSearch(q, { country, limit, sort });
    return NextResponse.json(
      {
        apps: result.apps,
        queriesUsed: result.queriesUsed,
        sort: result.sort,
        expanded: result.expanded,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json({ apps: [], queriesUsed: [], sort, expanded: false }, { status: 200 });
  }
}
