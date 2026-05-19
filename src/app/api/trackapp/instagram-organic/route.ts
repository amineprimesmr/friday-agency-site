import { NextResponse } from "next/server";

import { fetchInstagramOrganicContentCached } from "@/lib/instagram-organic-content";

export const maxDuration = 45;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileUrl = searchParams.get("url")?.trim() ?? "";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "12") || 12, 1), 30);

  if (!profileUrl) {
    return NextResponse.json({ error: "URL Instagram manquante" }, { status: 400 });
  }

  const result = await fetchInstagramOrganicContentCached(profileUrl, limit);
  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
