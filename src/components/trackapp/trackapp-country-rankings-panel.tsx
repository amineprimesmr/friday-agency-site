"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import type { CountryCode, CountryRanking } from "@/lib/apple-charts";
import { applyStoreRatingsToCountryRankings } from "@/lib/apple-charts";
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
        <span className="trackapp-country-globe__loading-label">Globe…</span>
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

function rankPositionLabel(index: number, rank: number | null): string {
  if (rank === null) return "—";
  return String(index + 1);
}

function rankPositionClass(index: number, rank: number | null): string {
  if (rank === null) return "trackapp-country-rankings__pos--none";
  if (index === 0) return "trackapp-country-rankings__pos--gold";
  if (index === 1) return "trackapp-country-rankings__pos--silver";
  if (index === 2) return "trackapp-country-rankings__pos--bronze";
  return "trackapp-country-rankings__pos--default";
}

type Props = Readonly<{
  appId: string;
  rankings: readonly CountryRanking[];
  className?: string;
  /** Ratings iTunes déjà mergés côté serveur — pas de refetch client. */
  ratingsEnriched?: boolean;
}>;

export function TrackappCountryRankingsPanel({
  appId,
  rankings: initialRankings,
  className,
  ratingsEnriched = false,
}: Props) {
  const [rankings, setRankings] = useState<CountryRanking[]>(() => [...initialRankings]);
  const sorted = useMemo(() => sortCountryRankings(rankings), [rankings]);
  const rankedOnly = useMemo(() => sorted.filter((r) => r.rank !== null), [sorted]);
  const summary = useMemo(() => countryRankSummary(rankings), [rankings]);
  const [focusCountry, setFocusCountry] = useState<CountryCode | null>(
    summary.best?.country ?? null,
  );
  const [globeReady, setGlobeReady] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? sorted : rankedOnly.slice(0, 12);

  useEffect(() => {
    setRankings([...initialRankings]);
  }, [initialRankings]);

  useEffect(() => {
    if (ratingsEnriched) return undefined;
    const ac = new AbortController();
    void fetch(`/api/trackapp/country-ratings?appId=${encodeURIComponent(appId)}`, {
      signal: ac.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ratings?: Partial<Record<CountryCode, { rating: number; count: number }>> } | null) => {
        if (!data?.ratings || ac.signal.aborted) return;
        setRankings((prev) => applyStoreRatingsToCountryRankings(prev, data.ratings!));
      })
      .catch(() => undefined);
    return () => ac.abort();
  }, [appId, ratingsEnriched]);

  useEffect(() => {
    const t = window.setTimeout(() => setGlobeReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const focusRow = focusCountry ? sorted.find((r) => r.country === focusCountry) : null;

  return (
    <section
      className={cn(
        "trackapp-country-rankings rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]",
        className,
      )}
      aria-label="Classement par pays"
    >
      <div className="trackapp-country-rankings__head">
        <div>
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Top pays</h2>
          <p className="mt-1 text-[0.8rem] text-[var(--dash-muted-light)]">
            Classement App Store · top 100 gratuit
          </p>
        </div>
        <div className="trackapp-country-rankings__stats">
          <span className="trackapp-country-rankings__stat">
            <strong>{summary.rankedCount}</strong> classés
          </span>
          {summary.availableCount > 0 ? (
            <span className="trackapp-country-rankings__stat">
              <strong>{summary.availableCount}</strong> dispos
            </span>
          ) : null}
          {summary.best ? (
            <span className="trackapp-country-rankings__best">
              #{summary.best.rank} {summary.best.flag} {summary.best.name}
            </span>
          ) : null}
        </div>
      </div>

      <div className="trackapp-country-rankings__layout">
        <div className="trackapp-country-rankings__globe-col">
          {globeReady ? (
            <TrackappCountryRankingsGlobe
              rankings={sorted}
              focusCountry={focusCountry}
              onFocusCountry={setFocusCountry}
            />
          ) : (
            <div className="trackapp-country-globe trackapp-country-globe--loading" aria-hidden>
              <span className="trackapp-country-globe__loading-label">Globe…</span>
            </div>
          )}
          {focusRow ? (
            <div className="trackapp-country-rankings__tooltip" role="status">
              <span className="trackapp-country-rankings__tooltip-flag">{focusRow.flag}</span>
              <span className="trackapp-country-rankings__tooltip-name">{focusRow.name}</span>
              {focusRow.rank ? (
                <>
                  <span className="trackapp-country-rankings__tooltip-rank">Rang #{focusRow.rank}</span>
                  <span className="trackapp-country-rankings__tooltip-plateau">
                    Top {rankPresencePercent(focusRow.rank)}%
                  </span>
                </>
              ) : focusRow.storeAvailable ? (
                <span className="trackapp-country-rankings__tooltip-rank">Dispo · hors top 100</span>
              ) : (
                <span className="trackapp-country-rankings__tooltip-rank">Hors top 100</span>
              )}
              {focusRow.storeRating ? (
                <span className="trackapp-country-rankings__tooltip-rating">
                  ★ {focusRow.storeRating.toFixed(1)}
                  {focusRow.storeRatingCount
                    ? ` · ${focusRow.storeRatingCount.toLocaleString("fr-FR")} avis`
                    : ""}
                </span>
              ) : (
                <span className="trackapp-country-rankings__tooltip-rating trackapp-country-rankings__tooltip-rating--pending">
                  Note locale…
                </span>
              )}
              {focusRow.isTopMarket ? (
                <span className="trackapp-country-rankings__tooltip-top">Marché principal</span>
              ) : null}
            </div>
          ) : (
            <p className="trackapp-country-rankings__hint">
              Glissez le globe · touchez un pays dans le classement
            </p>
          )}
        </div>

        <div className="trackapp-country-rankings__list-wrap">
          <ol className="trackapp-country-rankings__list">
            {visibleRows.map((r, index) => {
              const tier = countryRankTier(r.rank);
              const active = focusCountry === r.country;
              const rankedIndex = r.rank !== null ? rankedOnly.findIndex((x) => x.country === r.country) : -1;
              return (
                <li
                  key={r.country}
                  className={cn(
                    "trackapp-country-rankings__item",
                    active && "trackapp-country-rankings__item--active",
                    r.rank === null && "trackapp-country-rankings__item--unranked",
                  )}
                >
                  <button
                    type="button"
                    className="trackapp-country-rankings__item-btn"
                    onClick={() => setFocusCountry(r.country)}
                  >
                    <span
                      className={cn(
                        "trackapp-country-rankings__pos",
                        rankPositionClass(rankedIndex >= 0 ? rankedIndex : index, r.rank),
                      )}
                      aria-hidden
                    >
                      {rankPositionLabel(rankedIndex >= 0 ? rankedIndex : index, r.rank)}
                    </span>
                    <span className="trackapp-country-rankings__item-flag" aria-hidden>
                      {r.flag}
                    </span>
                    <span className="trackapp-country-rankings__item-body">
                      <span className="trackapp-country-rankings__item-name">{r.name}</span>
                      <span className="trackapp-country-rankings__item-meta">
                        {r.storeRating ? (
                          <span>★ {r.storeRating.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-400">Note…</span>
                        )}
                        {r.rank ? (
                          <span>Top {rankPresencePercent(r.rank)}%</span>
                        ) : r.storeAvailable ? (
                          <span>Hors top 100</span>
                        ) : null}
                        {r.isTopMarket ? (
                          <span className="trackapp-country-rankings__item-tag">Principal</span>
                        ) : null}
                      </span>
                    </span>
                    <span className="trackapp-country-rankings__item-rank">
                      {r.rank ? (
                        <span className={cn("trackapp-country-rankings__badge", tierBadgeClass(tier))}>
                          #{r.rank}
                        </span>
                      ) : (
                        <span className="trackapp-country-rankings__badge trackapp-country-rankings__badge--none">
                          —
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {rankedOnly.length > 12 || sorted.length > rankedOnly.length ? (
            <button
              type="button"
              className="trackapp-country-rankings__toggle"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? "Voir le top uniquement"
                : sorted.length > rankedOnly.length
                  ? `Voir tous les marchés (${sorted.length})`
                  : `Voir tout le classement (${rankedOnly.length})`}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
