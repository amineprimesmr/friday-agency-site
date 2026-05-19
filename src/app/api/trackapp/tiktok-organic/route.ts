import { NextResponse } from "next/server";

import { fetchTikTokOrganicContentCached } from "@/lib/tiktok-organic-content";

export const maxDuration = 120;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileUrl = searchParams.get("url")?.trim() ?? "";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "24") || 24, 1), 50);

  if (!profileUrl) {
    return NextResponse.json({ error: "URL TikTok manquante" }, { status: 400 });
  }

  const result = await fetchTikTokOrganicContentCached(profileUrl, limit);
  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
