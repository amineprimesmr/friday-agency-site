import { Suspense, type ReactNode } from "react";

import type { AppDetail, CountryCode } from "@/lib/apple-charts";
import { TrackappAppStoreScreenshots } from "@/components/trackapp/trackapp-app-store-screenshots";
import { TrackappSearchHistoryRecorder } from "@/components/trackapp/trackapp-search-history-recorder";
import { TrackappApplabSectionLazy } from "@/components/trackapp/trackapp-applab-section-lazy";
import { TrackappOfficialPresenceSection } from "@/components/trackapp/trackapp-official-presence-section";
import {
  TrackappAccueilAnalysisRoot,
  TrackappAnalysisLoading,
  TrackappAnalysisSection,
  TrackappAnalysisStatusBar,
  TrackappAnalysisStepMarker,
} from "@/components/trackapp/trackapp-accueil-analysis";
import {
  TrackappAccueilCountryRankingsAsync,
  TrackappAccueilCountryRankingsSkeleton,
  TrackappAccueilInAppOffersAsync,
  TrackappAccueilInAppOffersSkeleton,
  TrackappAccueilMetricsAsync,
  TrackappAccueilMetricsSkeleton,
} from "@/components/trackapp/trackapp-accueil-async-sections";
import { TrackappCompetitorsPanelLazy } from "@/components/trackapp/trackapp-competitors-panel-lazy";
import { TrackappGuestPreviewBanner } from "@/components/trackapp/trackapp-guest-preview-banner";
import { TrackappPremiumGate } from "@/components/trackapp/trackapp-premium-gate";

import "@/styles/trackapp-guest-preview.css";

const PREMIUM_GATES = {
  metrics: {
    title: "Métriques & performance",
    description: "Téléchargements, revenus estimés, taille et top pays — réservés aux membres Trackapp.",
  },
  iap: {
    title: "Achats intégrés",
    description: "Abonnements et prix in-app extraits de l’App Store en temps réel.",
  },
  social: {
    title: "Présence sociale & Meta Ads",
    description: "Réseaux officiels, galeries Instagram/TikTok et bibliothèque publicitaire Meta.",
  },
  rankings: {
    title: "Classements internationaux",
    description: "Carte interactive et positions par pays sur tous les marchés App Store.",
  },
  competitors: {
    title: "Analyse concurrentielle IA",
    description: "Apps similaires détectées par intelligence sémantique — idéal pour copier une niche.",
  },
  applab: {
    title: "Intelligence AppLAB",
    description: "Analyse IA complète : opportunité, monétisation et plan d'action pour lancer votre app.",
  },
} as const;

function Gate({
  gateKey,
  appId,
  country,
  guestMode,
  children,
  className,
}: Readonly<{
  gateKey: keyof typeof PREMIUM_GATES;
  appId: string;
  country: string;
  guestMode: boolean;
  children: ReactNode;
  className?: string;
}>) {
  if (!guestMode) return <>{children}</>;
  const meta = PREMIUM_GATES[gateKey];
  return (
    <TrackappPremiumGate
      title={meta.title}
      description={meta.description}
      appId={appId}
      country={country}
      className={className}
    >
      {children}
    </TrackappPremiumGate>
  );
}

export function TrackappAccueilAppDetailView({
  app,
  country,
  countryCode,
  guestMode = false,
  autoOpenApplabExport = false,
}: Readonly<{
  app: AppDetail;
  country: string;
  countryCode: CountryCode;
  guestMode?: boolean;
  autoOpenApplabExport?: boolean;
}>) {
  const screenshotUrls = app.screenshotUrls ?? [];

  return (
    <TrackappAccueilAnalysisRoot appName={app.name}>
      <div className="relative z-[1] dashboard-main pb-16">
        {guestMode ? <TrackappGuestPreviewBanner appName={app.name} appId={app.id} country={country} /> : null}

        {!guestMode ? (
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
        ) : null}

        <TrackappAnalysisStatusBar />

        <TrackappAnalysisSection stepId="hero">
          <div className="mb-3 flex items-center justify-end gap-3">
            {guestMode ? <span className="trackapp-guest-badge">Aperçu gratuit</span> : null}
            <a
              href={app.trackViewUrl || app.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-[0.88rem] font-semibold text-slate-500 no-underline transition hover:text-slate-900"
            >
              App Store ↗
            </a>
          </div>

          <section className="overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
            <div className="relative p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-100 to-transparent" aria-hidden />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[28px] bg-slate-100 ring-1 ring-slate-200">
                  {app.artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.artworkUrl}
                      alt={app.name}
                      className="h-full w-full object-cover"
                      width={112}
                      height={112}
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="trackapp-workspace-hero-kicker mb-2">{guestMode ? "Aperçu Trackapp AI" : "Accueil"}</p>
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
            </div>
          </section>
        </TrackappAnalysisSection>

        <Gate gateKey="applab" appId={app.id} country={country} guestMode={guestMode}>
          <TrackappApplabSectionLazy
            appId={app.id}
            appName={app.name}
            country={country}
            artworkUrl={app.artworkUrl}
            artistName={app.artistName}
            autoOpenExport={autoOpenApplabExport}
          />
        </Gate>

        <Suspense fallback={<TrackappAccueilMetricsSkeleton />}>
          <TrackappAnalysisSection stepId="metrics">
            <Gate gateKey="metrics" appId={app.id} country={country} guestMode={guestMode}>
              <TrackappAccueilMetricsAsync appId={app.id} country={countryCode} app={app} />
            </Gate>
          </TrackappAnalysisSection>
        </Suspense>

        <Suspense fallback={<TrackappAccueilInAppOffersSkeleton className="mt-5" />}>
          <TrackappAnalysisSection stepId="iap" className="mt-5">
            <Gate gateKey="iap" appId={app.id} country={country} guestMode={guestMode}>
              <TrackappAccueilInAppOffersAsync appId={app.id} country={countryCode} />
            </Gate>
          </TrackappAnalysisSection>
        </Suspense>

        <Suspense fallback={<TrackappAnalysisLoading stepId="social" />}>
          <TrackappAnalysisSection stepId="social">
            <Gate gateKey="social" appId={app.id} country={country} guestMode={guestMode}>
              <TrackappOfficialPresenceSection app={app} country={countryCode} />
            </Gate>
          </TrackappAnalysisSection>
        </Suspense>

        <Suspense fallback={<TrackappAccueilCountryRankingsSkeleton className="mt-5" />}>
          <TrackappAnalysisSection stepId="rankings" className="mt-5">
            <Gate gateKey="rankings" appId={app.id} country={country} guestMode={guestMode}>
              <TrackappAccueilCountryRankingsAsync appId={app.id} />
            </Gate>
          </TrackappAnalysisSection>
        </Suspense>

        {screenshotUrls.length > 0 ? (
          <TrackappAnalysisSection stepId="screenshots">
            <TrackappAppStoreScreenshots urls={screenshotUrls} title="Screenshots App Store" />
          </TrackappAnalysisSection>
        ) : (
          <TrackappAnalysisStepMarker stepId="screenshots" />
        )}

        {guestMode ? (
          <TrackappAnalysisSection stepId="competitors">
            <Gate gateKey="competitors" appId={app.id} country={country} guestMode={guestMode}>
              <TrackappCompetitorsPanelLazy appId={app.id} appName={app.name} country={countryCode} />
            </Gate>
          </TrackappAnalysisSection>
        ) : (
          <TrackappCompetitorsPanelLazy appId={app.id} appName={app.name} country={countryCode} />
        )}
      </div>
    </TrackappAccueilAnalysisRoot>
  );
}
