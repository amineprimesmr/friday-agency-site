import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam, searchApps, type CountryCode } from "@/lib/apple-charts";
import {
  enrichSearchResultsWithTrackappMetricsForLiveSearch,
  TRACKAPP_METRICS_UNAVAILABLE_LABEL,
} from "@/lib/trackapp-app-display-metrics";
import { finalizeTrackappRevenueEurLabel } from "@/lib/trackapp-revenue-display";

export const maxDuration = 60;

function langChip(codes: string[] | undefined): string {
  if (!codes?.length) return "";
  const first = codes[0]?.toUpperCase() ?? "";
  const extra = codes.length - 1;
  return extra > 0 ? `${first} +${String(extra)}` : first;
}

function revenueForSearchRow(revenueDisplay: string): string {
  if (revenueDisplay === TRACKAPP_METRICS_UNAVAILABLE_LABEL) return "—";
  const raw = revenueDisplay || "—";
  return raw === "—" ? raw : finalizeTrackappRevenueEurLabel(raw);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country")) as CountryCode;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "12") || 12, 1), 12);

  if (!q) {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }

  try {
    const raw = await searchApps(q, country, limit);
    const enriched = await enrichSearchResultsWithTrackappMetricsForLiveSearch(raw, country);

    const apps = enriched.map((app) => ({
      id: app.id,
      name: app.name,
      artistName: app.artistName,
      category: app.category,
      categoryId: app.categoryId,
      artworkUrl: app.artworkUrl,
      rank: app.rank,
      releaseDate: app.releaseDate,
      rating: app.averageUserRating,
      langLabel: langChip(app.languageCodesISO2A),
      revenueDisplay: revenueForSearchRow(app.trackappMetrics.revenueDisplay),
      metricSource: app.trackappMetrics.metricSource,
    }));

    return NextResponse.json(
      { apps },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }
}
