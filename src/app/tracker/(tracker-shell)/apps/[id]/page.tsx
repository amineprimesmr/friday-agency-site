import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import {
  COUNTRY_MAP,
  rankPresencePercent,
  formatRatingCount,
  formatBytes,
  estimateMonthlyDownloads,
  formatEstimatedMonthlyRevenuePrecise,
  timeAgo,
  daysSince,
  normalizeTrackerCountryParam,
  type CountryCode,
  type CountryRanking,
  type AppEntry,
} from "@/lib/apple-charts";
import { AppOfficialPresenceSection } from "@/components/tracker/app-official-presence-section";
import {
  fetchAppDetailCached,
  fetchCountryRankingsCached,
  loadTrackerAppEmbedContextCached,
} from "@/lib/tracker-server-cache";
import {
  buildAppStoreTrackerSimilarEmbedSrc,
  buildEmbedCountriesIframeSrc,
  buildEmbedMarketIframeSrc,
} from "@/lib/embed-url";
import { AppMetricCards } from "@/components/tracker/app-metric-cards";
import { AppScreenshots } from "@/components/tracker/app-screenshots";
import { AppCreatives } from "@/components/tracker/app-creatives";
import { AppTabs } from "@/components/tracker/app-tabs";
import { Suspense } from "react";

export const revalidate = 900;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; tab?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetailCached(id);
  if (!app) return {};
  return {
    title: `${app.name} — App Store Tracker`,
    description: `Classements App Store et aperçu marketing. ${app.description?.slice(0, 120)}`,
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

function CountryRankingsPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="tracker-shimmer h-3 w-40 rounded-full" />
        <div className="tracker-shimmer h-5 w-16 rounded-full opacity-70" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="tracker-shimmer size-4 shrink-0 rounded opacity-60" />
            <div className="tracker-shimmer h-3 flex-1 max-w-[7rem] rounded opacity-50" />
            <div className="tracker-shimmer ml-auto h-5 w-10 shrink-0 rounded-full opacity-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function CountryRankingsAside({ appId }: { appId: string }) {
  const countryRankings = await fetchCountryRankingsCached(appId);
  const rankedCount = countryRankings.filter((r) => r.rank !== null).length;
  return <CountryRankingsPanel rankings={countryRankings} rankedCount={rankedCount} />;
}

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
  country: CountryCode;
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
          <TrackerNavLink
            key={app.id}
            href={`/tracker/apps/${app.id}?country=${country}`}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/[0.06] ${app.id === currentId ? "bg-white/[0.08]" : ""}`}
          >
            <span className="font-mono text-xs font-semibold text-white/35">#{app.rank}</span>
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
              {app.artworkUrl ? (
                <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="32px" />
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
          </TrackerNavLink>
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
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const tab = sp.tab ?? "overview";

  const ctx = await loadTrackerAppEmbedContextCached(id, country as CountryCode);
  if (!ctx) notFound();

  const {
    app,
    sidebarApps,
    overallRank,
    displayRank,
    rankHeroMode,
    aggregateMetrics: agg,
  } = ctx;

  const useAggregateMetrics = Boolean(
    agg && agg.downloadsString !== "—" && agg.revenueString !== "—",
  );

  const embedCountriesSrc = buildEmbedCountriesIframeSrc(id, {
    theme: "dark",
    view: "list",
    country,
  });
  const embedSimilarSrc = buildAppStoreTrackerSimilarEmbedSrc(id, { theme: "system", country });
  const embedMarketSrc = buildEmbedMarketIframeSrc(id, { theme: "dark", country });

  const countryData = COUNTRY_MAP[country as CountryCode];
  const ageYears = app.releaseDate ? Math.floor(daysSince(app.releaseDate) / 365) : null;

  const activeTab: "overview" | "official" =
    tab === "official" || tab === "ads" ? "official" : "overview";

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
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link
              href={`/trackapp/paiement?app=${encodeURIComponent(id)}`}
              prefetch={false}
              className="rounded-full bg-violet-600/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_8px_30px_-6px_rgba(124,58,237,.45)] hover:bg-violet-500"
            >
              Copier cette app pour le workspace
            </Link>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="flex min-w-0 gap-4 sm:gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/12 sm:h-28 sm:w-28">
              {app.artworkUrl ? (
                <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="112px" priority />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white/5 text-3xl font-bold text-white/40">
                  {app.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">{app.name}</h1>
                <TrackerNavLink
                  href={`/tracker/developer/${encodeURIComponent(app.artistName)}?country=${country}`}
                  className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-sky-300/95 transition hover:text-sky-200 break-words"
                >
                  <span className="min-w-0">{app.artistName}</span>
                  <span aria-hidden className="shrink-0 text-xs opacity-75">
                    ↗
                  </span>
                </TrackerNavLink>
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
            <TrackerNavLink
              href={`/tracker/developer/${encodeURIComponent(app.artistName)}?country=${country}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-center text-sm font-medium text-white/75 transition hover:border-white/22 hover:bg-white/[0.1] hover:text-white"
            >
              Profil développeur
            </TrackerNavLink>
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.07] pt-6 sm:mt-10 sm:pt-8">
          <AppMetricCards
            rankMain={displayRank !== null ? `#${displayRank}` : "—"}
            rankSubtitle={
              rankHeroMode === "overall"
                ? `Top gratuit · ${countryData?.name ?? country.toUpperCase()}`
                : rankHeroMode === "genre"
                  ? `${app.primaryGenreName} · dans le top 100 gratuit · ${countryData?.name ?? country.toUpperCase()}`
                  : `Hors top 100 gratuit · ${countryData?.name ?? country.toUpperCase()}`
            }
            showRankLive={rankHeroMode === "overall"}
            ratingsMain={app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—"}
            ratingsSubtitle={
              app.averageUserRating > 0
                ? `${formatRatingCount(app.userRatingCount)} avis · ${app.currentVersionReleaseDate ? timeAgo(app.currentVersionReleaseDate) : "—"}`
                : "Aucune note pour ce marché."
            }
            ratingsFreshBadge={notesFreshBadge}
            downloadsMain={
              useAggregateMetrics && agg
                ? agg.downloadsString.toUpperCase()
                : overallRank !== null
                  ? estimateMonthlyDownloads(overallRank, country)
                  : "—"
            }
            downloadsSubtitle="/mois"
            downloadsSourceLabel={useAggregateMetrics ? "Agrégé · monde" : null}
            downloadsSourceAccent={useAggregateMetrics}
            revenueMain={
              useAggregateMetrics && agg
                ? agg.revenueString
                : overallRank !== null
                  ? formatEstimatedMonthlyRevenuePrecise(
                      overallRank,
                      app.price,
                      app.primaryGenreId,
                      country,
                      id,
                    )
                  : "—"
            }
            revenueSubtitle="/mois"
            revenueSourceLabel={useAggregateMetrics ? "Agrégé · monde" : null}
            revenueSourceAccent={useAggregateMetrics}
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

              {app.screenshotUrls.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <AppCreatives appName={app.name} urls={app.screenshotUrls} />
                </div>
              )}
            </>
          )}

          {activeTab === "official" && (
            <Suspense
              fallback={
                <div className="space-y-4" aria-busy="true">
                  <div className="tracker-shimmer h-40 w-full rounded-2xl" />
                  <div className="tracker-shimmer h-56 w-full rounded-2xl opacity-80" />
                </div>
              }
            >
              <AppOfficialPresenceSection app={app} appId={id} country={country as CountryCode} sidebarApps={sidebarApps} />
            </Suspense>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Suspense fallback={<CountryRankingsPanelSkeleton />}>
            <CountryRankingsAside appId={id} />
          </Suspense>
          <CompetitorsPanel
            apps={sidebarApps}
            currentId={id}
            country={country}
            category={app.primaryGenreName}
          />
        </div>
      </div>

      <section className="mt-10 space-y-5 border-t border-white/[0.07] pt-10">
        <div>
          <h2 className="text-lg font-semibold text-white">Vues embarquées</h2>
          <p className="mt-1 max-w-3xl text-sm text-white/45">
            Les blocs pays et marché utilisent les routes <span className="font-mono text-[13px] text-white/60">/embed/…</span>{" "}
            de ce site ; «&nbsp;Apps proches&nbsp;» charge l’embed public{" "}
            <span className="font-mono text-[13px] text-white/60">www.appstoretracker.com/embed/similar/{id}</span> (pays&nbsp;:{" "}
            {countryData?.flag} {countryData?.name ?? country}).
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Classements par pays</h3>
            <iframe
              title="Classements par pays — embed"
              src={embedCountriesSrc}
              className="h-[min(480px,62vh)] w-full rounded-2xl border border-white/[0.08] bg-black"
              loading="lazy"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Apps proches</h3>
            <iframe
              title="Apps proches — embed"
              src={embedSimilarSrc}
              className="appstoretracker-embed appstoretracker-similar h-[min(520px,65vh)] w-full rounded-[12px] border-0 bg-black"
              loading="lazy"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Part de marché (échantillon)</h3>
            <iframe
              title="Marché — embed"
              src={embedMarketSrc}
              className="h-[min(620px,78vh)] w-full rounded-2xl border border-white/[0.08] bg-black"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
