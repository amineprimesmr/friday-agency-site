import Image from "next/image";

import type { AppDetail } from "@/lib/apple-charts";
import { formatBytes } from "@/lib/apple-charts";
import { TrackappAppFavoriteButton } from "@/components/trackapp/trackapp-app-favorite-button";
import { TrackappCreateAppCta } from "@/components/trackapp/trackapp-create-app-cta";

type Props = Readonly<{
  app: AppDetail;
  country: string;
  loggedIn: boolean;
  appFav: boolean;
  downloadsValue: string;
  revenueValue: string;
  metricSource: string;
  appAgeLabel: string;
}>;

export function TrackappAppDetailHero({
  app,
  country,
  loggedIn,
  appFav,
  downloadsValue,
  revenueValue,
  metricSource,
  appAgeLabel,
}: Props) {
  const rating =
    app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : null;

  return (
    <header className="ta-detail-hero">
      <div className="ta-detail-hero__inner">
        <div className="min-w-0 flex-1">
          <div className="ta-detail-hero__identity">
            <div className="ta-detail-hero__icon">
              {app.artworkUrl ? (
                <Image
                  src={app.artworkUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="84px"
                  priority
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h1 className="ta-detail-hero__title">{app.name}</h1>
              <p className="ta-detail-hero__artist">{app.artistName}</p>
              <div className="ta-detail-hero__chips">
                <span className="ta-detail-chip ta-detail-chip--accent">
                  {app.category || app.primaryGenreName || "App"}
                </span>
                <span className="ta-detail-chip">{app.formattedPrice}</span>
                {app.trackContentRating ? (
                  <span className="ta-detail-chip">{app.trackContentRating}</span>
                ) : null}
                {rating ? (
                  <span className="ta-detail-chip">★ {rating}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="ta-detail-meta" aria-label="Métadonnées app">
            <span className="ta-detail-meta__item">
              <strong>Téléchargements</strong> {downloadsValue}
            </span>
            <span className="ta-detail-meta__dot" aria-hidden />
            <span className="ta-detail-meta__item">
              <strong>Revenus</strong> {revenueValue}
            </span>
            <span className="ta-detail-meta__dot" aria-hidden />
            <span className="ta-detail-meta__item">
              <strong>Ancienneté</strong> {appAgeLabel}
            </span>
            {app.version ? (
              <>
                <span className="ta-detail-meta__dot" aria-hidden />
                <span className="ta-detail-meta__item">
                  <strong>Version</strong> {app.version}
                </span>
              </>
            ) : null}
            {app.fileSizeBytes ? (
              <>
                <span className="ta-detail-meta__dot" aria-hidden />
                <span className="ta-detail-meta__item">
                  <strong>Taille</strong> {formatBytes(app.fileSizeBytes)}
                </span>
              </>
            ) : null}
            <span className="ta-detail-meta__dot" aria-hidden />
            <span className="ta-detail-meta__item">
              <span>{metricSource}</span>
            </span>
          </div>
        </div>

        <div className="ta-detail-hero__actions">
          <TrackappCreateAppCta appId={app.id} country={country} />
          {loggedIn ? (
            <TrackappAppFavoriteButton appId={app.id} initialFavorite={appFav} enabled />
          ) : null}
          <a
            href={app.trackViewUrl || app.url}
            target="_blank"
            rel="noreferrer"
            className="ta-detail-btn-store"
          >
            App Store ↗
          </a>
        </div>
      </div>
    </header>
  );
}
