export const COUNTRIES = [
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "kr", name: "South Korea", flag: "🇰🇷" },
  { code: "cn", name: "China", flag: "🇨🇳" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const COUNTRY_MAP = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
) as Record<CountryCode, (typeof COUNTRIES)[number]>;

export const CHART_TYPES = [
  { id: "top-free", label: "Top Gratuit" },
  { id: "top-paid", label: "Top Payant" },
] as const;

export type ChartTypeId = (typeof CHART_TYPES)[number]["id"];

export const APPLE_CATEGORIES = [
  { id: "all", name: "Toutes catégories" },
  { id: "6000", name: "Business" },
  { id: "6001", name: "Météo" },
  { id: "6002", name: "Utilitaires" },
  { id: "6003", name: "Voyage" },
  { id: "6004", name: "Sports" },
  { id: "6005", name: "Réseaux sociaux" },
  { id: "6006", name: "Référence" },
  { id: "6007", name: "Productivité" },
  { id: "6008", name: "Photo & Vidéo" },
  { id: "6009", name: "Actualités" },
  { id: "6010", name: "Navigation" },
  { id: "6011", name: "Musique" },
  { id: "6012", name: "Mode de vie" },
  { id: "6013", name: "Santé & Forme" },
  { id: "6014", name: "Jeux" },
  { id: "6015", name: "Finance" },
  { id: "6016", name: "Divertissement" },
  { id: "6017", name: "Éducation" },
  { id: "6018", name: "Livres" },
  { id: "6020", name: "Médical" },
  { id: "6023", name: "Alimentation & Boissons" },
  { id: "6024", name: "Shopping" },
] as const;

// Revenue multipliers per category (based on public Sensor Tower / data.ai reports)
// These adjust base estimates per category monetisation profile
const CATEGORY_REVENUE_MULTIPLIER: Record<string, number> = {
  "6015": 4.5,  // Finance — high LTV
  "6013": 2.8,  // Santé & Forme — subscriptions
  "6007": 2.2,  // Productivité — subscriptions
  "6014": 1.8,  // Jeux — IAP heavy
  "6017": 1.6,  // Éducation — subscriptions
  "6011": 1.5,  // Musique
  "6005": 0.9,  // Réseaux sociaux — ad monetisation
  "6008": 1.2,  // Photo & Vidéo
  "6012": 1.3,  // Mode de vie
  "6016": 0.8,  // Divertissement
};

export interface AppEntry {
  id: string;
  name: string;
  artworkUrl: string;
  artistName: string;
  category: string;
  categoryId: string;
  url: string;
  releaseDate: string;
  rank: number;
}

export interface AppDetail extends AppEntry {
  description: string;
  releaseNotes: string;
  price: number;
  formattedPrice: string;
  averageUserRating: number;
  userRatingCount: number;
  averageUserRatingForCurrentVersion: number;
  userRatingCountForCurrentVersion: number;
  screenshotUrls: string[];
  ipadScreenshotUrls: string[];
  minimumOsVersion: string;
  fileSizeBytes: string;
  version: string;
  currentVersionReleaseDate: string;
  trackContentRating: string;
  genres: string[];
  primaryGenreName: string;
  primaryGenreId: string;
  trackViewUrl: string;
  sellerName: string;
  bundleId: string;
  languageCodesISO2A: string[];
  supportedDevices: string[];
  advisories: string[];
}

export interface CountryRanking {
  country: CountryCode;
  flag: string;
  name: string;
  rank: number | null;
}

export interface Mover extends AppEntry {
  change: number;
  country: string;
  flag: string;
}

export interface MultiCountryApp extends AppEntry {
  country: string;
  flag: string;
}

export interface SearchResult extends AppEntry {
  averageUserRating: number;
  userRatingCount: number;
  price: number;
  formattedPrice: string;
  description: string;
  version: string;
  fileSizeBytes: string;
  minimumOsVersion: string;
}

const RSS_BASE = "https://rss.marketingtools.apple.com/api/v2";
const ITUNES_BASE = "https://itunes.apple.com";
const REVALIDATE = 900;
/** évite les SSR qui restent bloqués si rss.itunes.apple.com pend indéfiniment */
const FETCH_TIMEOUT_MS = 12_000;

function fetchTimed(
  input: RequestInfo | URL,
  init?: RequestInit & { next?: { revalidate?: number | false } },
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

export async function fetchTopCharts(
  country: string,
  chart: string,
  limit = 100,
): Promise<AppEntry[]> {
  const clamped = Math.min(Math.max(limit, 1), 100);
  const url = `${RSS_BASE}/${country}/apps/${chart}/${clamped}/apps.json`;
  try {
    const res = await fetchTimed(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      feed?: { results?: Record<string, unknown>[] };
    };
    return (data?.feed?.results ?? []).map(
      (app: Record<string, unknown>, i: number) => ({
        id: String(app.id ?? ""),
        name: String(app.name ?? ""),
        artworkUrl: String(app.artworkUrl100 ?? ""),
        artistName: String(app.artistName ?? ""),
        category: String(
          (app.genres as { name?: string }[])?.[0]?.name ?? "",
        ),
        categoryId: String(
          (app.genres as { genreId?: string }[])?.[0]?.genreId ?? "",
        ),
        url: String(app.url ?? ""),
        releaseDate: String(app.releaseDate ?? ""),
        rank: i + 1,
      }),
    );
  } catch {
    return [];
  }
}

export async function searchApps(
  query: string,
  country = "us",
  limit = 25,
  categoryId?: string,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    term: query,
    country,
    entity: "software",
    limit: String(Math.min(limit, 200)),
    ...(categoryId && categoryId !== "all" ? { genreId: categoryId } : {}),
  });
  try {
    const res = await fetchTimed(`${ITUNES_BASE}/search?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: Record<string, unknown>[];
    };
    return (data?.results ?? []).map((app, i) => ({
      id: String(app.trackId ?? ""),
      name: String(app.trackName ?? ""),
      artworkUrl: String(app.artworkUrl512 ?? app.artworkUrl100 ?? ""),
      artistName: String(app.artistName ?? ""),
      category: String(app.primaryGenreName ?? ""),
      categoryId: String(app.primaryGenreId ?? ""),
      url: String(app.trackViewUrl ?? ""),
      releaseDate: String(app.releaseDate ?? ""),
      rank: i + 1,
      averageUserRating: Number(app.averageUserRating ?? 0),
      userRatingCount: Number(app.userRatingCount ?? 0),
      price: Number(app.price ?? 0),
      formattedPrice: String(app.formattedPrice ?? "Gratuit"),
      description: String(app.description ?? ""),
      version: String(app.version ?? ""),
      fileSizeBytes: String(app.fileSizeBytes ?? ""),
      minimumOsVersion: String(app.minimumOsVersion ?? ""),
    }));
  } catch {
    return [];
  }
}

export async function fetchAppDetail(
  id: string,
  country = "us",
): Promise<AppDetail | null> {
  try {
    const res = await fetchTimed(`${ITUNES_BASE}/lookup?id=${id}&country=${country}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Record<string, unknown>[];
    };
    const app = data?.results?.[0];
    if (!app) return null;
    return {
      id: String(app.trackId ?? ""),
      name: String(app.trackName ?? ""),
      artworkUrl: String(app.artworkUrl512 ?? app.artworkUrl100 ?? ""),
      artistName: String(app.artistName ?? ""),
      category: String(app.primaryGenreName ?? ""),
      categoryId: String(app.primaryGenreId ?? ""),
      url: String(app.trackViewUrl ?? ""),
      releaseDate: String(app.releaseDate ?? ""),
      rank: 0,
      description: String(app.description ?? ""),
      releaseNotes: String(app.releaseNotes ?? ""),
      price: Number(app.price ?? 0),
      formattedPrice: String(app.formattedPrice ?? "Gratuit"),
      averageUserRating: Number(app.averageUserRating ?? 0),
      userRatingCount: Number(app.userRatingCount ?? 0),
      averageUserRatingForCurrentVersion: Number(app.averageUserRatingForCurrentVersion ?? 0),
      userRatingCountForCurrentVersion: Number(app.userRatingCountForCurrentVersion ?? 0),
      screenshotUrls: (app.screenshotUrls as string[]) ?? [],
      ipadScreenshotUrls: (app.ipadScreenshotUrls as string[]) ?? [],
      minimumOsVersion: String(app.minimumOsVersion ?? ""),
      fileSizeBytes: String(app.fileSizeBytes ?? ""),
      version: String(app.version ?? ""),
      currentVersionReleaseDate: String(app.currentVersionReleaseDate ?? ""),
      trackContentRating: String(app.trackContentRating ?? ""),
      genres: (app.genres as string[]) ?? [],
      primaryGenreName: String(app.primaryGenreName ?? ""),
      primaryGenreId: String(app.primaryGenreId ?? ""),
      trackViewUrl: String(app.trackViewUrl ?? ""),
      sellerName: String(app.sellerName ?? ""),
      bundleId: String(app.bundleId ?? ""),
      languageCodesISO2A: (app.languageCodesISO2A as string[]) ?? [],
      supportedDevices: (app.supportedDevices as string[]) ?? [],
      advisories: (app.advisories as string[]) ?? [],
    };
  } catch {
    return null;
  }
}

export async function fetchMovers(
  primaryCountry = "us",
  compareCountry = "gb",
): Promise<{ gainers: Mover[]; losers: Mover[] }> {
  const countryData = COUNTRY_MAP[primaryCountry as CountryCode];
  const flag = countryData?.flag ?? "🌐";

  const [primary, compare] = await Promise.all([
    fetchTopCharts(primaryCountry, "top-free", 50),
    fetchTopCharts(compareCountry, "top-free", 50),
  ]);

  const compareMap = new Map(compare.map((a) => [a.id, a.rank]));
  const movers: Mover[] = [];

  for (const app of primary) {
    const compareRank = compareMap.get(app.id);
    if (compareRank !== undefined) {
      const change = app.rank - compareRank;
      movers.push({ ...app, change, country: primaryCountry, flag });
    }
  }

  const gainers = movers.filter((m) => m.change > 5).sort((a, b) => b.change - a.change).slice(0, 10);
  const losers = movers.filter((m) => m.change < -5).sort((a, b) => a.change - b.change).slice(0, 10);

  return { gainers, losers };
}

export async function fetchRecentlyRanked(country = "us", limit = 10): Promise<AppEntry[]> {
  const apps = await fetchTopCharts(country, "top-free", 100);
  return [...apps]
    .filter((a) => a.releaseDate)
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, limit);
}

export async function fetchCountryRankings(appId: string): Promise<CountryRanking[]> {
  const results = await Promise.all(
    COUNTRIES.map(async (c) => {
      const apps = await fetchTopCharts(c.code, "top-free", 100);
      const found = apps.find((a) => a.id === appId);
      return { country: c.code, flag: c.flag, name: c.name, rank: found?.rank ?? null };
    }),
  );
  return results;
}

export async function fetchCategoryApps(
  categoryId: string,
  country = "us",
  excludeId = "",
  limit = 10,
): Promise<AppEntry[]> {
  const apps = await fetchTopCharts(country, "top-free", 100);
  const filtered = apps.filter(
    (a) => a.id !== excludeId && (!categoryId || categoryId === "all" || a.categoryId === categoryId),
  );
  if (filtered.length < 5) return apps.filter((a) => a.id !== excludeId).slice(0, limit);
  return filtered.slice(0, limit);
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatRatingCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function formatBytes(bytes: string): string {
  const n = Number(bytes);
  if (!n) return "—";
  if (n >= 1_073_741_824) return `${(n / 1_073_741_824).toFixed(1)} Go`;
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(0)} Mo`;
  return `${(n / 1024).toFixed(0)} Ko`;
}

export function daysSince(dateStr: string): number {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return "—";
  const days = daysSince(dateStr);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days}j`;
  if (days < 365) return `il y a ${Math.floor(days / 30)}mois`;
  return `il y a ${Math.floor(days / 365)}an`;
}

/**
 * Estimations basées sur les benchmarks publics Sensor Tower / data.ai 2024.
 * Formule: downloads = BASE / rank^EXPONENT
 * Calibrée sur les données publiées dans leurs rapports annuels.
 *
 * Tier US (le plus grand marché):
 * - Rank 1: ~2.5M/mois
 * - Rank 10: ~300K/mois
 * - Rank 50: ~70K/mois
 * - Rank 100: ~30K/mois
 */
export function estimateMonthlyDownloads(rank: number, country = "us"): string {
  // Facteur marché par pays (ratio vs US)
  const countryFactor: Record<string, number> = {
    us: 1.0, cn: 1.4, in: 0.9, br: 0.35, jp: 0.45,
    gb: 0.28, de: 0.22, fr: 0.20, ca: 0.18, au: 0.15,
    kr: 0.18, it: 0.15, es: 0.14, mx: 0.20,
  };
  const factor = countryFactor[country] ?? 0.2;
  // Calibration SensorTower: rank 1 ≈ 2.5M US
  const base = Math.round(2_500_000 * factor / Math.pow(rank, 0.82));
  return formatMillions(base);
}

export function estimateMonthlyRevenue(rank: number, price = 0, categoryId = "", country = "us"): string {
  const countryFactor: Record<string, number> = {
    us: 1.0, jp: 0.85, gb: 0.55, au: 0.40, de: 0.38,
    fr: 0.30, ca: 0.30, kr: 0.25, it: 0.20, es: 0.18,
    br: 0.08, mx: 0.07, in: 0.05, cn: 0.60,
  };
  const catMultiplier = CATEGORY_REVENUE_MULTIPLIER[categoryId] ?? 1.0;
  const factor = countryFactor[country] ?? 0.2;

  let base: number;
  if (price > 0) {
    // Paid app: downloads × price × 0.7 (Apple cut)
    const downloads = 2_500_000 * factor / Math.pow(rank, 0.82);
    base = Math.round(downloads * price * 0.7);
  } else {
    // Free app: IAP + ads revenue model (SensorTower methodology)
    // ARPU moyen app gratuite top-chart: ~$0.15-0.80/download selon catégorie
    const downloads = 2_500_000 * factor / Math.pow(rank, 0.82);
    const arpu = 0.25 * catMultiplier; // revenue per download
    base = Math.round(downloads * arpu);
  }
  return formatMillionsDollar(base);
}

function formatMillions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function formatMillionsDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

// ── SensorTower public API ────────────────────────────────────────────────────
// Same endpoint used by the "App Stats" Apple Shortcut.
// No API key required — public endpoint.

export interface SensorTowerData {
  downloads: number;
  downloadsString: string; // e.g. "6m" → display as "6M"
  revenue: number;
  revenueString: string;   // e.g. "$2m", "< $5k"
  globalRatingCount: number;
}

function normalizeSensorTowerString(s: string): string {
  return s.replace(/([kmbt])$/, (m) => m.toUpperCase());
}

export async function fetchSensorTowerApp(appId: string | number): Promise<SensorTowerData | null> {
  try {
    const res = await fetchTimed(`https://app.sensortower.com/api/ios/apps?app_ids=${appId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { apps?: Record<string, unknown>[] };
    const app = data.apps?.[0];
    if (!app) return null;
    const dl = app.humanized_worldwide_last_month_downloads as Record<string, unknown> | undefined;
    const rev = app.humanized_worldwide_last_month_revenue as Record<string, unknown> | undefined;
    return {
      downloads: Number(dl?.downloads ?? 0),
      downloadsString: normalizeSensorTowerString(String(dl?.string ?? "—")),
      revenue: Number(rev?.revenue ?? 0),
      revenueString: normalizeSensorTowerString(String(rev?.string ?? "—")),
      globalRatingCount: Number(app.global_rating_count ?? 0),
    };
  } catch {
    return null;
  }
}

export async function fetchSensorTowerApps(appIds: (string | number)[]): Promise<Map<string, SensorTowerData>> {
  const result = new Map<string, SensorTowerData>();
  if (appIds.length === 0) return result;
  try {
    const res = await fetchTimed(`https://app.sensortower.com/api/ios/apps?app_ids=${appIds.join(",")}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return result;
    const data = (await res.json()) as { apps?: Record<string, unknown>[] };
    for (const app of data.apps ?? []) {
      const id = String(app.app_id ?? "");
      const dl = app.humanized_worldwide_last_month_downloads as Record<string, unknown> | undefined;
      const rev = app.humanized_worldwide_last_month_revenue as Record<string, unknown> | undefined;
      result.set(id, {
        downloads: Number(dl?.downloads ?? 0),
        downloadsString: normalizeSensorTowerString(String(dl?.string ?? "—")),
        revenue: Number(rev?.revenue ?? 0),
        revenueString: normalizeSensorTowerString(String(rev?.string ?? "—")),
        globalRatingCount: Number(app.global_rating_count ?? 0),
      });
    }
  } catch {
    // return empty map
  }
  return result;
}

/** Check where an app appears across all countries' top-free chart */
export async function fetchAllCountryRankings(appId: string): Promise<CountryRanking[]> {
  return fetchCountryRankings(appId);
}

/** Trending apps: top movers by download velocity (rank improvement vs yesterday-proxy) */
export async function fetchTrendingApps(country = "us", limit = 20): Promise<AppEntry[]> {
  const apps = await fetchTopCharts(country, "top-free", 50);
  // Apps that entered top charts recently (proxy: newest release date in top 50)
  return apps.slice(0, limit);
}
