import Link from "next/link";

import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import {
  TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL,
  type TrackappMonthlyPickResolved,
} from "@/lib/trackapp-apptracker-monthly-picks";
import type { CountryCode } from "@/lib/apple-charts";
import { cn } from "@/lib/utils";

type Props = Readonly<{
  country: CountryCode;
  picks: readonly TrackappMonthlyPickResolved[];
  /** Intégré sous AppLAB Studio (sans hero page entière). */
  embedded?: boolean;
  /** Style sombre AppLAB Studio. */
  studio?: boolean;
}>;

export function TrackappApptrackerMonthlySection({
  country,
  picks,
  embedded = false,
  studio = false,
}: Props) {
  const cardClass = studio
    ? "overflow-hidden rounded-[22px] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-[var(--ui-shadow-sm)] transition hover:border-[var(--ui-border-strong)] hover:shadow-[var(--ui-shadow-md)]"
    : "overflow-hidden rounded-[22px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)] transition hover:border-slate-300 hover:shadow-[var(--dash-shadow-lg)]";

  const blurbClass = studio
    ? "border-t border-[var(--ui-border)] bg-[var(--ui-surface-soft)] px-4 py-4 sm:px-5"
    : "border-t border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 sm:px-5";

  const blurbTextClass = studio
    ? "m-0 text-[0.88rem] font-semibold leading-relaxed text-[var(--ui-text-secondary)]"
    : "m-0 text-[0.88rem] font-semibold leading-relaxed text-slate-600";

  const badgeClass = studio
    ? "rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-soft)] px-3 py-1.5 text-[0.78rem] font-bold text-[var(--ui-text-secondary)]"
    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.78rem] font-bold text-slate-600 shadow-[var(--dash-shadow)]";

  return (
    <>
      <section className={embedded ? undefined : "dashboard-section"}>
        {embedded ? (
          <h2
            id={studio ? "ta-home-selection-title" : undefined}
            className={cn(
              "m-0 font-bold tracking-tight",
              studio
                ? "ta-applab-home-sections__title"
                : "text-[1.35rem] text-[var(--dash-text)]",
            )}
          >
            Notre sélection
          </h2>
        ) : (
          <>
            <p className="trackapp-workspace-hero-kicker">Trackapp</p>
            <h1 className="trackapp-workspace-hero-title">Notre sélection</h1>
            <p className="trackapp-workspace-hero-desc max-w-[70ch]">
              Les apps du mois à copier de A à Z — chaque fiche ouvre une analyse complète : métriques, screenshots,
              présence officielle.
            </p>
          </>
        )}
        {embedded && studio ? (
          <p className="ta-applab-home-sections__desc">
            Les apps du mois à analyser et copier — ouvrez une fiche pour lancer AppLAB sur chaque concurrent.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={badgeClass}>{TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL}</span>
        </div>
      </section>

      {picks.length === 0 ? (
        <section
          className={cn(
            "rounded-[26px] border border-dashed p-8 text-center",
            studio
              ? "border-amber-400/40 bg-amber-500/10"
              : "border-amber-300 bg-amber-50/80 shadow-[var(--dash-shadow)]",
          )}
        >
          <p className={cn("text-[0.95rem] font-semibold", studio ? "text-amber-100" : "text-amber-950")}>
            Impossible de charger la sélection pour cette boutique. Réessaie plus tard.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {picks.map(({ app, blurb, metrics }) => (
            <article key={app.id} className={cardClass}>
              <TrackappApptrackerAppResultCard
                app={app}
                country={country}
                metrics={metrics}
                className="rounded-none border-0 shadow-none hover:translate-y-0 hover:border-transparent hover:shadow-none"
              />
              <div className={blurbClass}>
                <p className={blurbTextClass}>
                  <span className={studio ? "mr-1.5 text-[var(--ui-muted)]" : "mr-1.5 text-slate-400"}>
                    À étudier
                  </span>
                  {blurb}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {!embedded ? (
        <section className="mt-10 rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 text-center shadow-inner">
          <p className="m-0 text-[0.92rem] font-semibold text-slate-700">Vous cherchez une autre app ?</p>
          <Link
            href="/trackapp#selection"
            className="mt-3 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.84rem] font-bold text-slate-900 no-underline shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Voir la sélection
          </Link>
        </section>
      ) : null}
    </>
  );
}
