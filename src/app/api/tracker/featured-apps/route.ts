import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  estimateMonthlyDownloads,
  fetchTopCharts,
  TRACKER_DEFAULT_COUNTRY,
} from "@/lib/apple-charts";

const cachedFeaturedApps = unstable_cache(
  async () => fetchTopCharts(TRACKER_DEFAULT_COUNTRY, "top-free", 10),
  ["tracker-featured-apps-v1"],
  { revalidate: 900 },
);

export async function GET() {
  try {
    const apps = await cachedFeaturedApps();
    const payload = apps.map((a) => ({
      id: a.id,
      name: a.name,
      artistName: a.artistName,
      category: a.category,
      categoryId: a.categoryId,
      artworkUrl: a.artworkUrl,
      rank: a.rank,
      releaseDate: a.releaseDate,
      dlEst: estimateMonthlyDownloads(a.rank, TRACKER_DEFAULT_COUNTRY),
    }));
    return NextResponse.json(
      { apps: payload },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }
}
