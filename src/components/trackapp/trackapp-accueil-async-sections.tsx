import type { ReactNode } from "react";

import {
  daysSince,
  formatAppAgeFr,
  formatBytes,
  formatRatingCount,
  timeAgo,
  type AppDetail,
  type CountryCode,
} from "@/lib/apple-charts";
import { countryRankSummary, sortCountryRankings } from "@/lib/country-rankings-display";
import { metricsFromEmbedContext } from "@/lib/trackapp-app-display-metrics";
import {
  finalizeTrackappDownloadsLabel,
  finalizeTrackappRevenueEurLabel,
} from "@/lib/trackapp-revenue-display";
import { previousMonthCaptionFr } from "@/lib/format-previous-month-fr";
import { cn } from "@/lib/utils";
import {
  fetchCountryRankingsEnrichedCached,
  loadAppStoreInAppOffersForPage,
  loadTrackerAppWorkspaceContextCached,
} from "@/lib/tracker-server-cache";
import {
  TrackappAnalysisLoading,
  TrackappAnalysisStaggerGrid,
  TrackappAnalysisStaggerItem,
} from "@/components/trackapp/trackapp-accueil-analysis";
import { TrackappCountryRankingsPanel } from "@/components/trackapp/trackapp-country-rankings-panel";
import { TrackappInAppOffersSection } from "@/components/trackapp/trackapp-in-app-offers-section";

export function TrackappAccueilMetricsSkeleton() {
  return <TrackappAnalysisLoading stepId="metrics" />;
}

export function TrackappAccueilInAppOffersSkeleton({ className }: Readonly<{ className?: string }>) {
  return <TrackappAnalysisLoading stepId="iap" className={className} />;
}

export function TrackappAccueilCountryRankingsSkeleton({ className }: Readonly<{ className?: string }>) {
  return <TrackappAnalysisLoading stepId="rankings" className={className} />;
}

function RatingStarsMetric({ value }: Readonly<{ value: number }>) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="flex items-center gap-1 text-amber-500" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-[1.35rem] leading-none ${
            i < full ? "text-amber-500" : half && i === full ? "text-amber-400/55" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ActiveSinceSub({
  releaseDate,
  inactive,
}: Readonly<{ releaseDate?: string; inactive?: boolean }>) {
  if (inactive) {
    return <span className="text-[var(--dash-muted-light)]">App inactive</span>;
  }
  if (!releaseDate || !Number.isFinite(daysSince(releaseDate))) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Actif depuis {formatAppAgeFr(releaseDate)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  sub,
  labelClassName,
}: Readonly<{
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  labelClassName?: string;
}>) {
  return (
    <div className="rounded-[20px] border border-[var(--dash-border)] bg-white p-4 shadow-[var(--dash-shadow)]">
      <p className={cn("text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400", labelClassName)}>
        {label}
      </p>
      <div className="mt-2 text-[1.35rem] font-black leading-tight tracking-tight text-[var(--dash-text)]">{value}</div>
      {sub ? <p className="mt-1 text-[0.8rem] text-[var(--dash-muted-light)]">{sub}</p> : null}
    </div>
  );
}

/** Métriques + top 3 pays — streamé après le hero (contexte workspace + rankings enrichis). */
export async function TrackappAccueilMetricsAsync({
  appId,
  country,
  app,
}: Readonly<{
  appId: string;
  country: CountryCode;
  app: AppDetail;
}>) {
  const [context, countryRankings] = await Promise.all([
    loadTrackerAppWorkspaceContextCached(appId, country),
    fetchCountryRankingsEnrichedCached(appId),
  ]);

  const aggregateMetrics = context?.aggregateMetrics ?? null;
  const overallRank = context?.overallRank ?? null;
  const genreSliceRank = context?.genreSliceRank ?? null;

  const globalRating =
    aggregateMetrics?.rating && aggregateMetrics.rating > 0
      ? aggregateMetrics.rating
      : app.averageUserRating;
  const globalRatingCount =
    aggregateMetrics?.globalRatingCount && aggregateMetrics.globalRatingCount > 0
      ? aggregateMetrics.globalRatingCount
      : app.userRatingCount;
  const lastUpdateLabel = aggregateMetrics?.updatedDate
    ? timeAgo(aggregateMetrics.updatedDate)
    : app.currentVersionReleaseDate
      ? timeAgo(app.currentVersionReleaseDate)
      : null;
  const validCount = aggregateMetrics?.validCountries?.length ?? 0;
  const listMetrics = metricsFromEmbedContext(
    app,
    country,
    aggregateMetrics,
    overallRank,
    genreSliceRank,
  );
  const downloadsValue = finalizeTrackappDownloadsLabel(listMetrics.downloadsDisplay);
  const revenueValue = finalizeTrackappRevenueEurLabel(listMetrics.revenueDisplay);
  const downloadsPeriodSub =
    listMetrics.metricSource === "donnée à corriger" ? listMetrics.metricSource : previousMonthCaptionFr();
  const revenuePeriodSub = downloadsPeriodSub;

  const topThreeCountries = sortCountryRankings(countryRankings)
    .filter((r): r is typeof r & { rank: number } => r.rank !== null)
    .slice(0, 3);
  const countriesSummary = countryRankSummary(countryRankings);
  const totalCountriesLabel =
    validCount > 0
      ? `${validCount} pays au total`
      : countriesSummary.rankedCount > 0
        ? `${countriesSummary.rankedCount} pays classés`
        : `${countriesSummary.total} marchés suivis`;

  return (
    <TrackappAnalysisStaggerGrid className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <TrackappAnalysisStaggerItem>
      <MetricCard
        label="Note mondiale"
        value={
          globalRating > 0 ? (
            <span className="flex flex-wrap items-center gap-2.5">
              <RatingStarsMetric value={globalRating} />
              <span>{globalRating.toFixed(1)}</span>
            </span>
          ) : (
            "—"
          )
        }
        sub={
          globalRatingCount > 0
            ? `${formatRatingCount(globalRatingCount)} avis`
            : "Avis indisponibles"
        }
      />
      </TrackappAnalysisStaggerItem>
      <TrackappAnalysisStaggerItem>
      <MetricCard
        label="Dernière MAJ"
        value={lastUpdateLabel ?? "—"}
        sub={
          <ActiveSinceSub
            releaseDate={app.releaseDate}
            inactive={aggregateMetrics?.active === false}
          />
        }
      />
      </TrackappAnalysisStaggerItem>
      <TrackappAnalysisStaggerItem>
      <MetricCard label="Téléchargements" value={downloadsValue} sub={downloadsPeriodSub} />
      </TrackappAnalysisStaggerItem>
      <TrackappAnalysisStaggerItem>
      <MetricCard label="Revenus" value={revenueValue} sub={revenuePeriodSub} />
      </TrackappAnalysisStaggerItem>
      <TrackappAnalysisStaggerItem>
      <MetricCard
        label="Taille"
        value={app.fileSizeBytes ? formatBytes(app.fileSizeBytes) : "—"}
        sub={
          app.minimumOsVersion
            ? `iOS ${app.minimumOsVersion} minimum`
            : app.fileSizeBytes
              ? "Poids de l’app"
              : "Taille indisponible"
        }
      />
      </TrackappAnalysisStaggerItem>
      <TrackappAnalysisStaggerItem>
      <MetricCard
        label="Top 3 pays"
        value={
          topThreeCountries.length > 0 ? (
            <ul className="m-0 list-none space-y-1.5 p-0">
              {topThreeCountries.map((r) => (
                <li
                  key={r.country}
                  className="flex items-center gap-1.5 text-[0.92rem] font-bold leading-tight tracking-tight"
                >
                  <span className="shrink-0 text-base leading-none" aria-hidden>
                    {r.flag}
                  </span>
                  <span className="min-w-0 truncate">{r.name}</span>
                  <span className="ml-auto shrink-0 tabular-nums text-emerald-700">#{r.rank}</span>
                </li>
              ))}
            </ul>
          ) : (
            "—"
          )
        }
        sub={topThreeCountries.length > 0 ? totalCountriesLabel : "Aucun classement top 100"}
      />
      </TrackappAnalysisStaggerItem>
    </TrackappAnalysisStaggerGrid>
  );
}

export async function TrackappAccueilInAppOffersAsync({
  appId,
  country,
  className,
}: Readonly<{
  appId: string;
  country: CountryCode;
  className?: string;
}>) {
  const inAppOffers = await loadAppStoreInAppOffersForPage(appId, country);
  return (
    <TrackappInAppOffersSection data={inAppOffers} appId={appId} country={country} className={className} />
  );
}

export async function TrackappAccueilCountryRankingsAsync({
  appId,
  className,
}: Readonly<{
  appId: string;
  className?: string;
}>) {
  const countryRankings = await fetchCountryRankingsEnrichedCached(appId);
  return (
    <TrackappCountryRankingsPanel appId={appId} rankings={countryRankings} ratingsEnriched className={className} />
  );
}
