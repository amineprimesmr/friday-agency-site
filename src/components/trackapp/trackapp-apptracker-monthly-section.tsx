import Link from "next/link";

import { TrackappAppFavoriteRow } from "@/components/trackapp/trackapp-app-favorite-row";
import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import {
  TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL,
  type TrackappMonthlyPickResolved,
} from "@/lib/trackapp-apptracker-monthly-picks";
import type { CountryCode } from "@/lib/apple-charts";

type Props = Readonly<{
  country: CountryCode;
  picks: readonly TrackappMonthlyPickResolved[];
  favoritesEnabled?: boolean;
  favoriteAppIds?: string[];
  /** Intégré dans le hub Apptracker (sans hero dupliqué ni CTA accueil). */
  embedded?: boolean;
}>;

export function TrackappApptrackerMonthlySection({
  country,
  picks,
  favoritesEnabled = false,
  favoriteAppIds = [],
  embedded = false,
}: Props) {
  const favSet = new Set(favoriteAppIds);

  return (
    <>
      <section className={embedded ? "mt-10" : "dashboard-section"}>
        {embedded ? (
          <h2 className="m-0 text-[1.35rem] font-bold tracking-tight text-[var(--dash-text)]">Apps du mois</h2>
        ) : (
          <>
            <p className="trackapp-workspace-hero-kicker">Apptracker · Trackapp</p>
            <h1 className="trackapp-workspace-hero-title">Notre sélection</h1>
            <p className="trackapp-workspace-hero-desc max-w-[70ch]">
              Les apps du mois à copier de A à Z — chaque fiche ouvre une analyse complète : métriques, screenshots,
              présence officielle.
            </p>
          </>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.78rem] font-bold text-slate-600 shadow-[var(--dash-shadow)]">
            {TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL}
          </span>
        </div>
      </section>

      {picks.length === 0 ? (
        <section className="rounded-[26px] border border-dashed border-amber-300 bg-amber-50/80 p-8 text-center shadow-[var(--dash-shadow)]">
          <p className="text-[0.95rem] font-semibold text-amber-950">
            Impossible de charger la sélection pour cette boutique. Réessaie plus tard ou utilise la recherche ci-dessus.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          {picks.map(({ app, blurb, metrics }) => (
            <article
              key={app.id}
              className="overflow-hidden rounded-[22px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)] transition hover:border-slate-300 hover:shadow-[var(--dash-shadow-lg)]"
            >
              {favoritesEnabled ? (
                <TrackappAppFavoriteRow
                  appId={app.id}
                  initialFavorite={favSet.has(app.id)}
                  favoritesEnabled={favoritesEnabled}
                >
                  <TrackappApptrackerAppResultCard
                    app={app}
                    country={country}
                    metrics={metrics}
                    className="rounded-none border-0 pr-11 shadow-none hover:translate-y-0 hover:border-transparent hover:shadow-none md:pr-14"
                  />
                </TrackappAppFavoriteRow>
              ) : (
                <TrackappApptrackerAppResultCard
                  app={app}
                  country={country}
                  metrics={metrics}
                  className="rounded-none border-0 shadow-none hover:translate-y-0 hover:border-transparent hover:shadow-none"
                />
              )}
              <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 sm:px-5">
                <p className="m-0 text-[0.88rem] font-semibold leading-relaxed text-slate-600">
                  <span className="mr-1.5 text-slate-400">À étudier</span>
                  {blurb}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {!embedded ? (
        <section className="mt-10 rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 text-center shadow-inner">
          <p className="m-0 text-[0.92rem] font-semibold text-slate-700">Tu cherches une autre app ?</p>
          <Link
            href="/trackapp/accueil"
            className="mt-3 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.84rem] font-bold text-slate-900 no-underline shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Ouvrir la recherche Apptracker
          </Link>
        </section>
      ) : null}
    </>
  );
}
