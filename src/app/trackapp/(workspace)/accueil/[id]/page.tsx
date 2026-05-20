import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  daysSince,
  formatBytes,
  formatRatingCount,
  normalizeTrackerCountryParam,
  timeAgo,
  type CountryCode,
} from "@/lib/apple-charts";
import { metricsFromEmbedContext } from "@/lib/trackapp-app-display-metrics";
import {
  finalizeTrackappDownloadsLabel,
  finalizeTrackappRevenueEurLabel,
} from "@/lib/trackapp-revenue-display";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";
import {
  fetchAppDetailCached,
  fetchCountryRankingsCached,
  loadAppStoreInAppOffersCached,
  loadAppStoreWebScreenshotsCached,
  loadTrackerAppEmbedContextCached,
} from "@/lib/tracker-server-cache";
import { TrackappBreadcrumbOverride } from "@/components/trackapp/trackapp-breadcrumb-context";
import { TrackappAppFavoriteButton } from "@/components/trackapp/trackapp-app-favorite-button";
import { TrackappAppStoreScreenshots } from "@/components/trackapp/trackapp-app-store-screenshots";
import { TrackappCountryRankingsPanel } from "@/components/trackapp/trackapp-country-rankings-panel";
import { TrackappInAppOffersSection } from "@/components/trackapp/trackapp-in-app-offers-section";
import { TrackappOfficialPresenceLoading } from "@/components/trackapp/trackapp-official-presence-loading";
import { TrackappSearchHistoryRecorder } from "@/components/trackapp/trackapp-search-history-recorder";
import { TrackappCompetitorsPanel } from "@/components/trackapp/trackapp-competitors-panel";
import { TrackappCreateAppCta } from "@/components/trackapp/trackapp-create-app-cta";
import { TrackappOfficialPresenceSection } from "@/components/trackapp/trackapp-official-presence-section";

export const maxDuration = 60;
export const revalidate = 900;

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string }>;
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetailCached(id);
  return {
    title: app ? `${app.name} — Trackapp` : "App — Trackapp",
    description: app?.description?.slice(0, 150),
  };
}

function Stars({ value }: Readonly<{ value: number }>) {
  if (!value) return <span className="text-slate-400">Pas encore de note</span>;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "" : half && i === full ? "opacity-55" : "opacity-20"}>
          ★
        </span>
      ))}
      <span className="ml-2 text-[0.88rem] font-semibold text-slate-700">{value.toFixed(1)}</span>
    </span>
  );
}

function MetricCard({ label, value, sub }: Readonly<{ label: string; value: string; sub?: string }>) {
  return (
    <div className="rounded-[20px] border border-[var(--dash-border)] bg-white p-4 shadow-[var(--dash-shadow)]">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-[1.35rem] font-black tracking-tight text-[var(--dash-text)]">{value}</p>
      {sub ? <p className="mt-1 text-[0.8rem] text-[var(--dash-muted-light)]">{sub}</p> : null}
    </div>
  );
}

export default async function TrackappAccueilAppDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const countryCode = country as CountryCode;
  const [context, favorites, webScreenshots, inAppOffers, countryRankings] = await Promise.all([
    loadTrackerAppEmbedContextCached(id, countryCode),
    getTrackappProfileFavorites(),
    loadAppStoreWebScreenshotsCached(id, countryCode),
    loadAppStoreInAppOffersCached(id, countryCode),
    fetchCountryRankingsCached(id),
  ]);
  if (!context) notFound();

  const { app, aggregateMetrics, overallRank, genreSliceRank } = context;
  /** Même source que la landing : agrégat ST du `loadTrackerAppEmbedContext`, pas un 2ᵉ fetch + cache SaaS. */
  const listMetrics = metricsFromEmbedContext(
    app,
    countryCode,
    aggregateMetrics,
    overallRank,
    genreSliceRank,
  );
  const downloadsValue = finalizeTrackappDownloadsLabel(listMetrics.downloadsDisplay);
  const revenueValue = finalizeTrackappRevenueEurLabel(listMetrics.revenueDisplay);
  const metricSource = listMetrics.metricSource;
  const appAge = app.releaseDate ? daysSince(app.releaseDate) : Number.NaN;
  const screenshotUrls =
    webScreenshots.iphone.length > 0 ? webScreenshots.iphone : (app.screenshotUrls ?? []);
  const { loggedIn, appIds } = favorites;
  const appFav = appIds.includes(app.id);

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <TrackappBreadcrumbOverride pageLabel={app.name} />
      <TrackappSearchHistoryRecorder
        app={{
          id: app.id,
          name: app.name,
          artistName: app.artistName,
          artworkUrl: app.artworkUrl,
          category: app.category || app.primaryGenreName || "App",
        }}
        country={countryCode}
      />
      <section className="overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-100 to-transparent" aria-hidden />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[28px] bg-slate-100 ring-1 ring-slate-200">
                {app.artworkUrl ? (
                  <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="112px" priority />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="trackapp-workspace-hero-kicker mb-2">Accueil</p>
                <h1 className="m-0 text-[clamp(2rem,5vw,3.4rem)] font-black leading-[0.98] tracking-[-0.06em] text-[var(--dash-text)]">
                  {app.name}
                </h1>
                <p className="mt-2 truncate text-[1rem] font-semibold text-[var(--dash-muted-light)]">{app.artistName}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.78rem] font-bold text-slate-600">{app.category || "App"}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.78rem] font-bold text-slate-600">{app.formattedPrice}</span>
                  {app.trackContentRating ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.78rem] font-bold text-slate-600">{app.trackContentRating}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end lg:items-start">
              <TrackappCreateAppCta appId={app.id} country={country} />
              {loggedIn ? (
                <TrackappAppFavoriteButton appId={app.id} initialFavorite={appFav} enabled />
              ) : null}
              <a
                href={app.trackViewUrl || app.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#0f172a] px-5 text-[0.88rem] font-bold text-white no-underline transition hover:bg-[#111827]"
              >
                Ouvrir sur l&apos;App Store ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Note" value={app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—"} sub={app.userRatingCount > 0 ? `${formatRatingCount(app.userRatingCount)} avis` : "Avis indisponibles"} />
        <MetricCard label="Téléchargements" value={downloadsValue} sub={metricSource} />
        <MetricCard label="Revenus" value={revenueValue} sub={metricSource} />
        <MetricCard label="Ancienneté" value={Number.isFinite(appAge) ? timeAgo(app.releaseDate) : "—"} sub={app.version ? `Version ${app.version}` : undefined} />
      </section>

      <TrackappInAppOffersSection data={inAppOffers} className="mt-5" />

      <TrackappCountryRankingsPanel rankings={countryRankings} className="mt-5" />

      <Suspense fallback={<TrackappOfficialPresenceLoading />}>
        <TrackappOfficialPresenceSection
          app={app}
          country={country as CountryCode}
          initialFavorite={appFav}
          favoritesEnabled={loggedIn}
        />
      </Suspense>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.75fr)]">
        <article className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Description</h2>
          <p className="mt-4 whitespace-pre-wrap text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
            {app.description || "Aucune description disponible."}
          </p>
        </article>

        <article className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Signaux rapides</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Rating</p>
              <div className="mt-2"><Stars value={app.averageUserRating} /></div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-[0.88rem] leading-relaxed text-slate-700">
              <strong className="text-slate-950">Taille :</strong> {formatBytes(app.fileSizeBytes)}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-[0.88rem] leading-relaxed text-slate-700">
              <strong className="text-slate-950">OS minimum :</strong> {app.minimumOsVersion || "—"}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-[0.88rem] leading-relaxed text-slate-700">
              <strong className="text-slate-950">Langues :</strong> {app.languageCodesISO2A?.slice(0, 8).join(", ") || "—"}
            </div>
          </div>
        </article>
      </section>

      <TrackappAppStoreScreenshots urls={screenshotUrls} title="Screenshots App Store" />

      <TrackappCompetitorsPanel appId={app.id} appName={app.name} country={countryCode} />
    </div>
  );
}
