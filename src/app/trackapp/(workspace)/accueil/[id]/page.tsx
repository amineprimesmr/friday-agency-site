import type { Metadata } from "next";
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
  applyTrackappAppDisplayOverride,
  getTrackappAppDisplayOverride,
} from "@/lib/trackapp-app-display-overrides";
import {
  finalizeTrackappDownloadsLabel,
  finalizeTrackappRevenueEurLabel,
} from "@/lib/trackapp-revenue-display";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";
import {
  fetchAppDetailCached,
  fetchCountryRankingsCached,
  loadAppStoreInAppOffersForPage,
  loadAppStoreWebScreenshotsCached,
  loadTrackerAppEmbedContextCached,
} from "@/lib/tracker-server-cache";
import { TrackappBreadcrumbOverride } from "@/components/trackapp/trackapp-breadcrumb-context";
import { TrackappAppStoreScreenshots } from "@/components/trackapp/trackapp-app-store-screenshots";
import { TrackappCountryRankingsPanel } from "@/components/trackapp/trackapp-country-rankings-panel";
import { TrackappInAppOffersSection } from "@/components/trackapp/trackapp-in-app-offers-section";
import { TrackappOfficialPresenceLoading } from "@/components/trackapp/trackapp-official-presence-loading";
import { TrackappSearchHistoryRecorder } from "@/components/trackapp/trackapp-search-history-recorder";
import { TrackappCompetitorsPanel } from "@/components/trackapp/trackapp-competitors-panel";
import { TrackappOfficialPresenceSection } from "@/components/trackapp/trackapp-official-presence-section";
import {
  TrackappAppDetailSection,
  TrackappAppDetailShell,
} from "@/components/trackapp/trackapp-app-detail-shell";
import { TrackappAppDetailHero } from "@/components/trackapp/trackapp-app-detail-hero";

import "@/styles/trackapp-app-detail.css";

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
      <span className="ml-1.5 text-[0.88rem] font-semibold text-slate-800">{value.toFixed(1)}</span>
    </span>
  );
}

function MetricTile({ label, value, sub }: Readonly<{ label: string; value: string; sub?: string }>) {
  return (
    <article className="ta-detail-metric">
      <p className="ta-detail-metric__label">{label}</p>
      <p className="ta-detail-metric__value">{value}</p>
      {sub ? <p className="ta-detail-metric__sub">{sub}</p> : null}
    </article>
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
    loadAppStoreInAppOffersForPage(id, countryCode),
    fetchCountryRankingsCached(id),
  ]);
  if (!context) notFound();

  const { app, aggregateMetrics, overallRank, genreSliceRank } = context;
  const metricsOverride = getTrackappAppDisplayOverride(app.id);
  const listMetrics = applyTrackappAppDisplayOverride(
    app.id,
    metricsFromEmbedContext(app, countryCode, aggregateMetrics, overallRank, genreSliceRank),
  );
  const downloadsValue = metricsOverride
    ? listMetrics.downloadsDisplay
    : finalizeTrackappDownloadsLabel(listMetrics.downloadsDisplay);
  const revenueValue = metricsOverride
    ? listMetrics.revenueDisplay
    : finalizeTrackappRevenueEurLabel(listMetrics.revenueDisplay);
  const metricSource = listMetrics.metricSource;
  const appAge = app.releaseDate ? daysSince(app.releaseDate) : Number.NaN;
  const appAgeLabel = Number.isFinite(appAge) ? timeAgo(app.releaseDate) : "—";
  const screenshotUrls =
    webScreenshots.iphone.length > 0 ? webScreenshots.iphone : (app.screenshotUrls ?? []);
  const { loggedIn, appIds } = favorites;
  const appFav = appIds.includes(app.id);
  const ratingValue =
    app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—";
  const ratingSub =
    app.userRatingCount > 0
      ? `${formatRatingCount(app.userRatingCount)} avis`
      : "Avis indisponibles";

  return (
    <div className="ta-detail-page relative z-[1] pb-16">
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

      <TrackappAppDetailHero
        app={app}
        country={country}
        loggedIn={loggedIn}
        appFav={appFav}
        downloadsValue={downloadsValue}
        revenueValue={revenueValue}
        metricSource={metricSource}
        appAgeLabel={appAgeLabel}
      />

      <TrackappAppDetailShell>
        <TrackappAppDetailSection id="ta-section-overview">
          <div className="ta-detail-metrics">
            <MetricTile label="Note" value={ratingValue} sub={ratingSub} />
            <MetricTile label="Téléchargements" value={downloadsValue} sub={metricSource} />
            <MetricTile label="Revenus" value={revenueValue} sub={metricSource} />
            <MetricTile
              label="Ancienneté"
              value={appAgeLabel}
              sub={app.version ? `Version ${app.version}` : undefined}
            />
          </div>

          <div className="ta-detail-overview-grid">
            <article className="ta-detail-card">
              <div className="ta-detail-card__head">
                <div>
                  <p className="ta-detail-card__kicker">Produit</p>
                  <h2 className="ta-detail-card__title">Description</h2>
                </div>
              </div>
              <div className="ta-detail-card__body ta-detail-card__body--flush-top">
                <p className="ta-detail-desc">
                  {app.description || "Aucune description disponible."}
                </p>
              </div>
            </article>

            <article className="ta-detail-card">
              <div className="ta-detail-card__head">
                <div>
                  <p className="ta-detail-card__kicker">Technique</p>
                  <h2 className="ta-detail-card__title">Signaux rapides</h2>
                </div>
              </div>
              <div className="ta-detail-card__body ta-detail-card__body--flush-top">
                <div className="ta-detail-signals">
                  <div className="ta-detail-signal">
                    <span className="ta-detail-signal__label">Rating</span>
                    <span className="ta-detail-signal__value">
                      <Stars value={app.averageUserRating} />
                    </span>
                  </div>
                  <div className="ta-detail-signal">
                    <span className="ta-detail-signal__label">Taille</span>
                    <span className="ta-detail-signal__value">{formatBytes(app.fileSizeBytes)}</span>
                  </div>
                  <div className="ta-detail-signal">
                    <span className="ta-detail-signal__label">OS minimum</span>
                    <span className="ta-detail-signal__value">{app.minimumOsVersion || "—"}</span>
                  </div>
                  <div className="ta-detail-signal">
                    <span className="ta-detail-signal__label">Langues</span>
                    <span className="ta-detail-signal__value">
                      {app.languageCodesISO2A?.slice(0, 10).join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {screenshotUrls.length > 0 ? (
            <article className="ta-detail-card">
              <div className="ta-detail-card__head">
                <div>
                  <p className="ta-detail-card__kicker">App Store</p>
                  <h2 className="ta-detail-card__title">Captures d&apos;écran</h2>
                </div>
              </div>
              <TrackappAppStoreScreenshots urls={screenshotUrls} embedded />
            </article>
          ) : null}
        </TrackappAppDetailSection>

        <TrackappAppDetailSection id="ta-section-monetization">
          <TrackappInAppOffersSection
            data={inAppOffers}
            appId={app.id}
            country={countryCode}
            embedded
          />
        </TrackappAppDetailSection>

        <TrackappAppDetailSection id="ta-section-rankings">
          <article className="ta-detail-card">
            <div className="ta-detail-card__head">
              <div>
                <p className="ta-detail-card__kicker">Marchés</p>
                <h2 className="ta-detail-card__title">Classements App Store</h2>
                <p className="ta-detail-card__sub">
                  Top 100 gratuit par pays — présence et rangs en temps réel.
                </p>
              </div>
            </div>
            <TrackappCountryRankingsPanel rankings={countryRankings} embedded />
          </article>
        </TrackappAppDetailSection>

        <TrackappAppDetailSection id="ta-section-presence">
          <div className="ta-detail-card ta-detail-presence-wrap">
            <Suspense fallback={<TrackappOfficialPresenceLoading embedded />}>
              <TrackappOfficialPresenceSection
                app={app}
                country={country as CountryCode}
                initialFavorite={appFav}
                favoritesEnabled={loggedIn}
                embedded
              />
            </Suspense>
          </div>
        </TrackappAppDetailSection>

        <TrackappAppDetailSection id="ta-section-intel">
          <TrackappCompetitorsPanel appId={app.id} appName={app.name} country={countryCode} embedded />
        </TrackappAppDetailSection>
      </TrackappAppDetailShell>
    </div>
  );
}
