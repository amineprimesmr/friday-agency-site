import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  estimateMonthlyDownloads,
  normalizeTrackerCountryParam,
  searchApps,
  type CountryCode,
} from "@/lib/apple-charts";

function formatReleaseMeta(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days >= 0 && days < 14) {
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "hier";
    return `il y a ${String(days)} j`;
  }
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function langChip(codes: string[] | undefined): string {
  if (!codes?.length) return "";
  const first = codes[0]?.toUpperCase() ?? "";
  const extra = codes.length - 1;
  return extra > 0 ? `${first} +${String(extra)}` : first;
}

const cachedSearchApps = unstable_cache(
  async (q: string, country: CountryCode, limit: number) => searchApps(q, country, limit),
  ["tracker-search-api-v1"],
  { revalidate: 300 },
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country"));
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "18") || 18, 1), 25);

  if (!q) {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }

  try {
    const raw = await cachedSearchApps(q, country, limit);
    const apps = raw.map((app) => ({
      id: app.id,
      name: app.name,
      artistName: app.artistName,
      category: app.category,
      categoryId: app.categoryId,
      artworkUrl: app.artworkUrl,
      rank: app.rank,
      releaseDate: app.releaseDate,
      dlEst: estimateMonthlyDownloads(app.rank || 50, country),
      releaseLine: formatReleaseMeta(app.releaseDate),
      rating: app.averageUserRating,
      langLabel: langChip(app.languageCodesISO2A),
    }));
    return NextResponse.json(
      { apps },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      },
    );
  } catch {
    return NextResponse.json({ apps: [] }, { status: 200 });
  }
}
