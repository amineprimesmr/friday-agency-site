import { NextResponse } from "next/server";

import { COUNTRIES, fetchStoreRatingsByCountry } from "@/lib/apple-charts";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: Request) {
  const appId = new URL(request.url).searchParams.get("appId")?.trim();
  if (!appId || !/^\d{6,12}$/.test(appId)) {
    return NextResponse.json({ error: "invalid_app_id" }, { status: 400 });
  }

  const ratings = await fetchStoreRatingsByCountry(
    appId,
    COUNTRIES.map((c) => c.code),
  );

  return NextResponse.json({ ratings });
}
