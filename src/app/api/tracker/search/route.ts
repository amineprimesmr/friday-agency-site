import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam, searchApps, type CountryCode } from "@/lib/apple-charts";
import { TRACKAPP_METRICS_UNAVAILABLE_LABEL } from "@/lib/trackapp-real-metrics-only";

/** @deprecated Préférer `/api/trackapp/live-search` + `/api/trackapp/search-metrics` (Sensor Tower). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country")) as CountryCode;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "12") || 12, 1), 24);

  if (!q) {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }

  try {
    const apps = await searchApps(q, country, limit);
    const payload = apps.map((app) => ({
      id: app.id,
      name: app.name,
      artistName: app.artistName,
      category: app.category,
      categoryId: app.categoryId,
      artworkUrl: app.artworkUrl,
      rank: app.rank,
      releaseDate: app.releaseDate,
      dlEst: TRACKAPP_METRICS_UNAVAILABLE_LABEL,
      revenueDisplay: TRACKAPP_METRICS_UNAVAILABLE_LABEL,
    }));
    return NextResponse.json({ apps: payload }, { status: 200 });
  } catch {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }
}
