"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import type { CountryCode, CountryRanking } from "@/lib/apple-charts";
import {
  countryRankSummary,
  countryRankTier,
  rankPresencePercent,
  sortCountryRankings,
} from "@/lib/country-rankings-display";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-country-rankings.css";

const TrackappCountryRankingsGlobe = dynamic(
  () =>
    import("@/components/trackapp/trackapp-country-rankings-globe").then(
      (m) => m.TrackappCountryRankingsGlobe,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="trackapp-country-globe trackapp-country-globe--loading" aria-hidden>
        <span className="trackapp-country-globe__loading-label">Chargement…</span>
      </div>
    ),
  },
);

function tierBadgeClass(tier: ReturnType<typeof countryRankTier>): string {
  if (tier === "top") return "trackapp-country-rankings__badge--top";
  if (tier === "strong") return "trackapp-country-rankings__badge--strong";
  if (tier === "mid") return "trackapp-country-rankings__badge--mid";
  return "trackapp-country-rankings__badge--none";
}

type Props = Readonly<{
  rankings: readonly CountryRanking[];
  className?: string;
  embedded?: boolean;
}>;

export function TrackappCountryRankingsPanel({ rankings, className, embedded = false }: Props) {
  const sorted = useMemo(() => sortCountryRankings(rankings), [rankings]);
  const summary = useMemo(() => countryRankSummary(rankings), [rankings]);
  const [focusCountry, setFocusCountry] = useState<CountryCode | null>(
    summary.best?.country ?? null,
  );
  const [globeEnabled, setGlobeEnabled] = useState(false);

  const focusRow = focusCountry ? sorted.find((r) => r.country === focusCountry) : null;

  return (
    <section
      className={cn(
        "trackapp-country-rankings",
        !embedded && "rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]",
        className,
      )}
      aria-label="Classements App Store par pays"
    >
      <div className="trackapp-country-rankings__head">
        <div>
          {!embedded ? (
            <>
              <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">
                Présence mondiale · Top 100 gratuit
              </h2>
              <p className="mt-1 text-[0.8rem] text-[var(--dash-muted-light)]">
                {summary.rankedCount}/{summary.total} marchés suivis · classement App Store
              </p>
            </>
          ) : (
            <p className="m-0 text-[0.8rem] text-[var(--dash-muted-light)]">
              {summary.rankedCount}/{summary.total} marchés · Top 100 gratuit
            </p>
          )}
        </div>
        {summary.best ? (
          <span className="trackapp-country-rankings__best">
            Meilleur : {summary.best.flag} {summary.best.name}{" "}
            <strong>#{summary.best.rank}</strong>
          </span>
        ) : null}
      </div>

      <div className="trackapp-country-rankings__layout">
        <div className="trackapp-country-rankings__globe-col">
          {globeEnabled ? (
            <TrackappCountryRankingsGlobe
              rankings={sorted}
              focusCountry={focusCountry}
              onFocusCountry={setFocusCountry}
            />
          ) : (
            <button
              type="button"
              className="trackapp-country-globe trackapp-country-globe--placeholder"
              onClick={() => setGlobeEnabled(true)}
            >
              <span className="trackapp-country-globe__placeholder-icon" aria-hidden>
                🌍
              </span>
              <span className="trackapp-country-globe__placeholder-title">Voir le globe interactif</span>
              <span className="trackapp-country-globe__placeholder-sub">
                Carte 3D · classements par pays (clic pour charger)
              </span>
            </button>
          )}
          {focusRow ? (
            <div className="trackapp-country-rankings__tooltip" role="status">
              <span className="trackapp-country-rankings__tooltip-flag">{focusRow.flag}</span>
              <span className="trackapp-country-rankings__tooltip-name">{focusRow.name}</span>
              {focusRow.rank ? (
                <>
                  <span className="trackapp-country-rankings__tooltip-rank">Rang #{focusRow.rank}</span>
                  <span className="trackapp-country-rankings__tooltip-plateau">
                    Plateau {rankPresencePercent(focusRow.rank)}%
                  </span>
                </>
              ) : (
                <span className="trackapp-country-rankings__tooltip-rank">Hors top 100</span>
              )}
            </div>
          ) : (
            <p className="trackapp-country-rankings__hint">
              {globeEnabled
                ? "Glissez le globe · cliquez un pays dans la liste"
                : "Cliquez un pays dans la liste · activez le globe pour la vue 3D"}
            </p>
          )}
        </div>

        <div className="trackapp-country-rankings__table-wrap">
          <table className="trackapp-country-rankings__table">
            <thead>
              <tr>
                <th>Pays</th>
                <th>Rang</th>
                <th className="hidden sm:table-cell">Plateau</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const tier = countryRankTier(r.rank);
                const active = focusCountry === r.country;
                return (
                  <tr
                    key={r.country}
                    className={active ? "trackapp-country-rankings__row--active" : undefined}
                  >
                    <td>
                      <button
                        type="button"
                        className="trackapp-country-rankings__row-btn"
                        onClick={() => setFocusCountry(r.country)}
                      >
                        <span className="text-base leading-none">{r.flag}</span>
                        <span>{r.name}</span>
                      </button>
                    </td>
                    <td>
                      {r.rank ? (
                        <span
                          className={cn(
                            "trackapp-country-rankings__badge",
                            tierBadgeClass(tier),
                          )}
                        >
                          #{r.rank}
                        </span>
                      ) : (
                        <span className="text-[0.78rem] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell">
                      {r.rank ? (
                        <div className="trackapp-country-rankings__plateau">
                          <span>{rankPresencePercent(r.rank)}%</span>
                          <span
                            className="trackapp-country-rankings__plateau-bar"
                            style={{ width: `${rankPresencePercent(r.rank)}%` }}
                          />
                        </div>
                      ) : (
                        <span className="text-[0.72rem] text-slate-400">Hors plateau</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-[0.72rem] leading-relaxed text-slate-400">
        Source : top 100 App Store gratuit par pays (FR, GB, DE, JP, BR, CA, AU, IT, ES, MX, IN, KR, CN).
        Pour des parts d&apos;audience (%), il faut une API marché type Sensor Tower Enterprise.
      </p>
    </section>
  );
}
