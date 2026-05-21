import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { fetchAppStoreInAppOffers } from "@/lib/apple-app-store-in-app-offers";

export const maxDuration = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const appId = (searchParams.get("appId") ?? searchParams.get("id") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country"));

  if (!appId || !/^\d+$/.test(appId)) {
    return NextResponse.json({ error: "appId_required" }, { status: 400 });
  }

  try {
    const data = await fetchAppStoreInAppOffers(appId, country);
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { offers: [], country, source: "unavailable" as const },
      { status: 200 },
    );
  }
}
