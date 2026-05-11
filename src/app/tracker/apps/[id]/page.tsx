import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAppDetail,
  fetchCountryRankings,
  fetchCategoryApps,
  fetchSensorTowerApp,
  COUNTRY_MAP,
  rankPresencePercent,
  estimateMonthlyRevenueUsd,
  type CountryCode,
  type CountryRanking,
  type AppEntry,
  formatRatingCount,
  formatBytes,
  estimateMonthlyDownloads,
  estimateMonthlyRevenue,
  timeAgo,
  daysSince,
} from "@/lib/apple-charts";
import { CategoryRevenueShare } from "@/components/tracker/category-revenue-share";
import { AppMetricCards } from "@/components/tracker/app-metric-cards";
import { WatchButton } from "@/components/tracker/watch-button";
import { AppScreenshots } from "@/components/tracker/app-screenshots";
import { AppCreatives } from "@/components/tracker/app-creatives";
import { AppAds } from "@/components/tracker/app-ads";
import { AppTabs } from "@/components/tracker/app-tabs";
import { EmbedCountriesModalTrigger } from "@/components/tracker/embed-countries-modal";
import { Suspense } from "react";

export const revalidate = 900;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; tab?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetail(id);
  if (!app) return {};
  return {
    title: `${app.name} — App Intelligence · App Store Tracker`,
    description: `Classements, estimations téléchargements & revenus, publicités Meta/TikTok. ${app.description?.slice(0, 120)}`,
  };
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const cls = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];
  return (
    <span className={`flex items-center gap-0.5 text-amber-400 ${cls}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "" : half && i === full ? "opacity-50" : "opacity-20"}>★</span>
      ))}
    </span>
  );
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-xs text-white/25">—</span>;
  const color =
    rank <= 10 ? "bg-white/12 text-white border-white/20"
    : rank <= 50 ? "bg-white/[0.08] text-white/85 border-white/12"
    : "bg-white/[0.06] text-white/50 border-white/10";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums ${color}`}>
      #{rank}
    </span>
  );
}

/** Pastille courte type ref. UI (16h / 6j) pour carte Notes. */
function shortFreshnessBadge(dateStr: string): string | undefined {
  const d = daysSince(dateStr);
  if (Number.isNaN(d) || d < 0) return undefined;
  if (d === 0) return "≤24h";
  if (d === 1) return "1j";
  if (d < 30) return `${d}j`;
  const months = Math.floor(d / 30);
  if (d < 365) return `${Math.min(months, 11)} mo`;
  return `${Math.floor(d / 365)} an`;
}

/* ── Sidebar panels ─────────────────────────────────────────────────────────── */

function CountryRankingsPanel({ rankings, rankedCount }: { rankings: CountryRanking[]; rankedCount: number }) {
  const sorted = [...rankings].sort((a, b) => {
    if (a.rank === null && b.rank === null) return a.name.localeCompare(b.name, "fr");
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name, "fr");
  });

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Classements par pays</h2>
        <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/42">
          {rankedCount}/{rankings.length} pays
        </span>
      </div>
      <div className="space-y-1">
        {sorted.map((r) => (
          <div
            key={r.country}
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5 transition sm:flex-nowrap ${r.rank ? "bg-white/[0.03] hover:bg-white/[0.06]" : "opacity-35"}`}
          >
            <span className="text-base leading-none">{r.flag}</span>
            <span className="min-w-[5.5rem] flex-1 text-xs text-white/68 sm:min-w-[7.5rem]">{r.name}</span>
            <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-0 sm:justify-start">
              <RankBadge rank={r.rank} />
              {typeof r.rank === "number" && r.rank >= 1 ? (
                <>
                  <span className="w-10 shrink-0 text-right text-[11px] font-semibold tabular-nums text-white/82 sm:w-11">
                    {rankPresencePercent(r.rank)}%
                  </span>
                  <div className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-white/[0.08] sm:w-16" title={`Présence plateau top 100 : ${rankPresencePercent(r.rank)} %`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400/70 via-white/35 to-white/12"
                      style={{ width: `${rankPresencePercent(r.rank)}%` }}
                    />
                  </div>
                </>
              ) : (
                <span className="shrink-0 text-[10px] text-white/35">Hors top 100</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorsPanel({ apps, currentId, country, category }: {
  apps: AppEntry[];
  currentId: string;
  country: string;
  category: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Concurrents</h2>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/40">{category}</span>
      </div>
      <div className="space-y-1.5">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={`/tracker/apps/${app.id}?country=${country}`}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/[0.06] ${app.id === currentId ? "bg-white/[0.08]" : ""}`}
          >
            <span className="font-mono text-xs font-semibold text-white/35">#{app.rank}</span>
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
              {app.artworkUrl ? (
                <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="32px" unoptimized />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/40">
                  {app.name.charAt(0)}
                </span>
              )}
            </span>
            <span className={`flex-1 truncate text-xs font-medium group-hover:text-white ${app.id === currentId ? "text-white" : "text-white/70"}`}>
              {app.name}
            </span>
            <span className="shrink-0 text-[11px] text-white/30">{estimateMonthlyDownloads(app.rank, country)}</span>
          </Link>
        ))}
        {apps.length === 0 && (
          <p className="py-6 text-center text-xs text-white/25">Aucun concurrent trouvé</p>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default async function AppDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { country = "us", tab = "overview" } = await searchParams;

  const [app, countryRankings, competitors, stData] = await Promise.all([
    fetchAppDetail(id, country as CountryCode),
    fetchCountryRankings(id),
    fetchCategoryApps("", country, id, 12),
    fetchSensorTowerApp(id),
  ]);

  if (!app) notFound();

  const categoryPeers = await fetchCategoryApps(app.primaryGenreId, country, id, 28);
  const sidebarApps = categoryPeers.length >= 5 ? categoryPeers.slice(0, 12) : competitors;

  const currentRanking = countryRankings.find((r) => r.country === country);
  const currentRank = currentRanking?.rank ?? null;

  let mergedForMarket = [...categoryPeers];
  if (currentRank !== null && !mergedForMarket.some((p) => p.id === id)) {
    mergedForMarket = [
      {
        id: app.id,
        name: app.name,
        artworkUrl: app.artworkUrl,
        artistName: app.artistName,
        category: app.primaryGenreName,
        categoryId: app.primaryGenreId,
        url: app.trackViewUrl,
        releaseDate: app.releaseDate,
        rank: currentRank,
      },
      ...mergedForMarket,
    ];
  }

  const marketRowsRaw = mergedForMarket.map((peer) => {
    const gid = peer.categoryId || app.primaryGenreId;
    const price = peer.id === app.id ? app.price : 0;
    const revenueUsd = estimateMonthlyRevenueUsd(peer.rank, price, gid, country);
    return {
      id: peer.id,
      name: peer.name,
      artworkUrl: peer.artworkUrl,
      rank: peer.rank,
      revenueUsd,
      sharePct: 0,
    };
  });
  const totalMarketUsd = marketRowsRaw.reduce((s, r) => s + r.revenueUsd, 0);
  const marketRows = marketRowsRaw.map((r) => ({
    ...r,
    sharePct: totalMarketUsd > 0 ? (r.revenueUsd / totalMarketUsd) * 100 : 0,
  }));

  const countryData = COUNTRY_MAP[country as CountryCode];
  const rankedCount = countryRankings.filter((r) => r.rank !== null).length;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const ageYears = app.releaseDate ? Math.floor(daysSince(app.releaseDate) / 365) : null;

  const activeTab: "overview" | "ads" = tab === "ads" ? "ads" : "overview";

  const notesFreshBadge =
    app.currentVersionReleaseDate && app.averageUserRating > 0
      ? shortFreshnessBadge(app.currentVersionReleaseDate)
      : undefined;

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-white/30">
          <Link href="/tracker" className="transition hover:text-white/60">
            Tableau de bord
          </Link>
          <span>/</span>
          <Link href="/tracker/top-charts" className="transition hover:text-white/60">
            Classements
          </Link>
          <span>/</span>
          <span className="text-white/55">{app.name}</span>
        </nav>
        <EmbedCountriesModalTrigger appId={id} appName={app.name} />
      </div>

      {/* Hero : flux uniquement — plus de badges en absolute sur le titre */}
      <div className="mb-6 rounded-2xl border border-white/[0.08] bg-neutral-950/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
        <header className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {app.price === 0 ? (
              <span className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/85">
                Gratuit
              </span>
            ) : null}
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/52">
              App Store Tracker
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/85">Intelligence boutique</p>
        </header>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="flex min-w-0 gap-4 sm:gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/12 sm:h-28 sm:w-28">
              {app.artworkUrl ? (
                <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="112px" unoptimized priority />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white/5 text-3xl font-bold text-white/40">
                  {app.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">{app.name}</h1>
                <Link
                  href={`/tracker/developer/${encodeURIComponent(app.artistName)}?country=${country}`}
                  className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-sky-300/95 transition hover:text-sky-200 break-words"
                >
                  <span className="min-w-0">{app.artistName}</span>
                  <span aria-hidden className="shrink-0 text-xs opacity-75">
                    ↗
                  </span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] leading-snug text-white/62">
                  {app.primaryGenreName}
                </span>
                {app.fileSizeBytes ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55 tabular-nums">
                    {formatBytes(app.fileSizeBytes)}
                  </span>
                ) : null}
                {app.trackContentRating ? (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                    {app.trackContentRating}
                  </span>
                ) : null}
                {app.minimumOsVersion ? (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50">
                    iOS {app.minimumOsVersion}+
                  </span>
                ) : null}
                {ageYears !== null && ageYears >= 0 ? (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50">
                    {ageYears === 0 ? "Moins d'1 an sur le Store" : `${ageYears} an${ageYears > 1 ? "s" : ""}`}
                  </span>
                ) : null}
                {countryData ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                    <span aria-hidden>{countryData.flag}</span>
                    {countryData.name}
                  </span>
                ) : null}
              </div>

              {app.averageUserRating > 0 ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={app.averageUserRating} size="md" />
                  <span className="text-sm font-semibold tabular-nums text-white/88">{app.averageUserRating.toFixed(1)}</span>
                  <span className="text-xs text-white/42">({formatRatingCount(app.userRatingCount)} avis)</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col lg:items-stretch lg:justify-start lg:w-56 xl:w-[13.5rem]">
            <WatchButton id={app.id} name={app.name} artworkUrl={app.artworkUrl ?? ""} category={app.primaryGenreName} />
            {app.trackViewUrl ? (
              <a
                href={app.trackViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
              >
                Voir sur App Store ↗
              </a>
            ) : null}
            <Link
              href={`/tracker/developer/${encodeURIComponent(app.artistName)}?country=${country}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-center text-sm font-medium text-white/75 transition hover:border-white/22 hover:bg-white/[0.1] hover:text-white"
            >
              Profil développeur
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.07] pt-6 sm:mt-10 sm:pt-8">
          <AppMetricCards
            rankMain={currentRank ? `#${currentRank}` : "—"}
            rankSubtitle={`Top Gratuit · ${countryData?.name ?? country.toUpperCase()}`}
            showRankLive={currentRank !== null}
            ratingsMain={app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—"}
            ratingsSubtitle={
              app.averageUserRating > 0
                ? `${formatRatingCount(app.userRatingCount)} avis · ${app.currentVersionReleaseDate ? timeAgo(app.currentVersionReleaseDate) : "—"}`
                : "Aucune note pour ce marché."
            }
            ratingsFreshBadge={notesFreshBadge}
            downloadsMain={
              stData
                ? stData.downloadsString.toUpperCase()
                : currentRank
                  ? estimateMonthlyDownloads(currentRank, country)
                  : "—"
            }
            downloadsSubtitle={`/mois · ${stData ? "données réelles" : "estimation"}`}
            downloadsSourceLabel={stData ? "⚡ SensorTower · Monde" : `Estimation · ${monthLabel}`}
            downloadsSourceAccent={Boolean(stData)}
            revenueMain={
              stData
                ? stData.revenueString.toUpperCase()
                : currentRank
                  ? estimateMonthlyRevenue(currentRank, app.price, app.primaryGenreId, country)
                  : "—"
            }
            revenueSubtitle={`/mois · ${stData ? "données réelles" : "estimation"}`}
            revenueSourceLabel={stData ? "⚡ SensorTower · Monde" : `Estimation · ${monthLabel}`}
            revenueSourceAccent={Boolean(stData)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Suspense>
          <AppTabs active={activeTab} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── LEFT ── */}
        <div className="space-y-5 min-w-0">
          {activeTab === "overview" && (
            <>
              {/* Screenshots */}
              {(app.screenshotUrls.length > 0 || app.ipadScreenshotUrls.length > 0) && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <AppScreenshots urls={app.screenshotUrls} ipadUrls={app.ipadScreenshotUrls} />
                </div>
              )}

              {totalMarketUsd > 0 ? (
                <CategoryRevenueShare
                  rows={marketRows}
                  totalUsd={totalMarketUsd}
                  currentAppId={id}
                  country={country}
                />
              ) : null}

              {/* Informations */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Informations</h2>
                <div className="divide-y divide-white/[0.05]">
                  {[
                    { label: "Éditeur", value: app.sellerName || app.artistName },
                    { label: "Bundle ID", value: app.bundleId },
                    { label: "Version", value: app.version },
                    { label: "Taille", value: formatBytes(app.fileSizeBytes) },
                    { label: "Catégorie", value: app.primaryGenreName },
                    { label: "Prix", value: app.price > 0 ? `${app.price}€` : "Gratuit" },
                    { label: "Compatibilité", value: app.minimumOsVersion ? `iOS ${app.minimumOsVersion}+` : "—" },
                    { label: "Âge", value: app.trackContentRating || "—" },
                    {
                      label: "Mis à jour",
                      value: app.currentVersionReleaseDate
                        ? new Date(app.currentVersionReleaseDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                        : "—",
                    },
                    {
                      label: "Sorti",
                      value: app.releaseDate
                        ? new Date(app.releaseDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                        : "—",
                    },
                    {
                      label: "Langues",
                      value: app.languageCodesISO2A.length > 0
                        ? `${app.languageCodesISO2A.slice(0, 6).join(", ")}${app.languageCodesISO2A.length > 6 ? ` +${app.languageCodesISO2A.length - 6}` : ""}`
                        : "—",
                    },
                  ]
                    .filter((r) => r.value && r.value !== "—")
                    .map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                        <span className="shrink-0 text-white/40">{label}</span>
                        <span className="text-right font-medium text-white/75 break-all">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Creatives */}
              {app.screenshotUrls.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <AppCreatives appName={app.name} urls={app.screenshotUrls} />
                </div>
              )}
            </>
          )}

          {activeTab === "ads" && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="mb-5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Intelligence Publicitaire</h2>
                <p className="mt-0.5 text-xs text-white/30">
                  Pubs actives Meta, TikTok, Google liées à {app.name}
                </p>
              </div>
              <AppAds
                appName={app.name}
                developerName={app.sellerName || app.artistName}
                bundleId={app.bundleId}
                countryCode={country}
              />
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <CountryRankingsPanel rankings={countryRankings} rankedCount={rankedCount} />
          <CompetitorsPanel
            apps={sidebarApps}
            currentId={id}
            country={country}
            category={app.primaryGenreName}
          />
        </div>
      </div>
    </div>
  );
}
