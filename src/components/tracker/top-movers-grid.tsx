import { TrackerAppArtwork } from "@/components/tracker/tracker-app-artwork";
import { ShowcaseHeroHeader } from "@/components/tracker/showcase-hero-header";
import { TrackerTrackappPaymentCta } from "@/components/tracker/tracker-trackapp-payment-cta";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import {
  TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL,
  getTrackappApptrackerMonthlyPicks,
  type TrackappMonthlyPickResolved,
} from "@/lib/trackapp-apptracker-monthly-picks";
import { TRACKER_DEFAULT_COUNTRY } from "@/lib/apple-charts";
import {
  TRACKAPP_NOTRE_SELECTION_PATH,
  trackappAccueilAppHref,
  trackappApercuAppHref,
} from "@/lib/trackapp-apptracker-paths";
import { trackappMonthlyPickRevenueHint } from "@/lib/trackapp-monthly-picks-display";
import { cn } from "@/lib/utils";

import "@/styles/tracker-hero-liquid-cta.css";

const GRID_COLS = 3;
const UNLOCKED_COUNT = GRID_COLS;

const tileClass =
  "tracker-touch tracker-rise group flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center transition hover:border-white/15 hover:bg-white/[0.05]";

function PickTileContent({
  pick,
}: Readonly<{
  pick: TrackappMonthlyPickResolved;
}>) {
  const { app, metrics } = pick;
  return (
    <>
      <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-white/10">
        <TrackerAppArtwork
          url={app.artworkUrl}
          name={app.name}
          sizes="48px"
          letterClassName="bg-white/5 text-base text-white/40"
        />
      </div>
      <p className="line-clamp-2 text-[11px] font-medium leading-tight text-white/80 group-hover:text-white">
        {app.name}
      </p>
      <span
        title="Revenu mensuel indicatif (agrégé monde — non contractuel)"
        className="max-w-[100%] truncate rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold tracking-tight text-emerald-200/95 ring-1 ring-white/12"
      >
        {trackappMonthlyPickRevenueHint(metrics)}
      </span>
    </>
  );
}

export async function TopMoversGrid() {
  const country = TRACKER_DEFAULT_COUNTRY;
  const picks = await getTrackappApptrackerMonthlyPicks(country);
  if (!picks.length) return null;

  const unlocked = picks.slice(0, UNLOCKED_COUNT);
  const lockedPreview = picks.slice(UNLOCKED_COUNT);

  const gridGap = "gap-2 sm:gap-2.5 md:gap-3";

  return (
    <section aria-labelledby="top-movers-heading" id="tracker-selection">
      <div className="px-12 sm:px-0">
        <ShowcaseHeroHeader
          align="center"
          bleed={false}
          headingId="top-movers-heading"
          title={`Notre sélection d'apps de ${TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL}`}
          titleClassName="build-next-hero-title--fintap-match"
          description="Les meilleures apps à copier, mises à jour chaque semaine."
          showBracketBadge={false}
          subFooter="none"
        />
      </div>

      <div className={cn("mx-auto flex max-w-xl flex-col sm:max-w-2xl", gridGap)}>
        <div className={cn("grid grid-cols-3", gridGap)}>
          {unlocked.map((pick, i) => (
            <TrackerNavLink
              key={`${country}-${pick.app.id}-open-${String(i)}`}
              href={trackappApercuAppHref(pick.app.id, country)}
              className={tileClass}
              style={{ animationDelay: `${Math.min(i, 22) * 26}ms` }}
            >
              <PickTileContent pick={pick} />
            </TrackerNavLink>
          ))}
        </div>

        {lockedPreview.length > 0 ? (
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
            <div className={cn("grid grid-cols-3", gridGap, "blur-sm saturate-[0.97]")} aria-hidden>
              {lockedPreview.map((pick, i) => (
                <div
                  key={`${country}-${pick.app.id}-blur-${String(i)}`}
                  className={cn(tileClass, "pointer-events-none")}
                >
                  <PickTileContent pick={pick} />
                </div>
              ))}
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/6 via-black/14 to-black/38"
            />

            <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 px-4 py-6 sm:px-6">
              <TrackerTrackappPaymentCta className="tracker-hero-liquidglass !mt-0">
                <span className="tracker-hero-liquidglass__label">Débloquer les apps</span>
              </TrackerTrackappPaymentCta>
              <TrackerNavLink
                href={TRACKAPP_NOTRE_SELECTION_PATH}
                className="text-center text-[11px] font-semibold text-white/70 underline-offset-2 transition hover:text-white hover:underline"
              >
                Voir toute la sélection →
              </TrackerNavLink>
            </div>
          </div>
        ) : null}

        {lockedPreview.length === 0 ? (
          <p className="text-center">
            <TrackerNavLink
              href={TRACKAPP_NOTRE_SELECTION_PATH}
              className="text-[12px] font-semibold text-white/55 underline-offset-2 transition hover:text-white/90 hover:underline"
            >
              Voir les {String(picks.length)} apps du mois dans Trackapp →
            </TrackerNavLink>
          </p>
        ) : null}
      </div>
    </section>
  );
}
