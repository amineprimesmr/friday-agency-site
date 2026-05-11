import { NextResponse } from "next/server";
import {
  estimateMonthlyDownloads,
  fetchTopCharts,
} from "@/lib/apple-charts";

export async function GET() {
  try {
    const apps = await fetchTopCharts("us", "top-free", 10);
    const payload = apps.map((a) => ({
      id: a.id,
      name: a.name,
      artistName: a.artistName,
      category: a.category,
      categoryId: a.categoryId,
      artworkUrl: a.artworkUrl,
      rank: a.rank,
      releaseDate: a.releaseDate,
      dlEst: estimateMonthlyDownloads(a.rank, "us"),
    }));
    return NextResponse.json({ apps: payload }, { status: 200 });
  } catch {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }
}
