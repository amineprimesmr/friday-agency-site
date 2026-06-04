import { NextResponse } from "next/server";

import { fetchAppDetail, normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { discoverOfficialLinks } from "@/lib/social-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country") ?? undefined);

  if (!id) {
    return NextResponse.json({ error: "Paramètre id requis (App Store ID)." }, { status: 400 });
  }

  const app = await fetchAppDetail(id, country);
  if (!app) {
    return NextResponse.json({ error: "App introuvable." }, { status: 404 });
  }

  const discovery = await discoverOfficialLinks(app);

  return NextResponse.json({
    app: { id: app.id, name: app.name },
    website: discovery.website,
    socials: discovery.socials,
    app_store: discovery.app_store,
    google_play: discovery.google_play,
    meta_ads_library: discovery.meta_ads_library,
    not_found: discovery.not_found,
    rejected_candidates: discovery.rejected_candidates,
    scanned_urls: discovery.scanned_urls,
    evidence_urls: discovery.evidence_urls,
  });
}
