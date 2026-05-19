"use client";

import { useId, useRef } from "react";

import { TrackappAppFavoriteRow } from "@/components/trackapp/trackapp-app-favorite-row";
import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import { useTrackappLiveAppSearch, TRACKAPP_SEARCH_MIN_QUERY_LEN } from "@/hooks/use-trackapp-live-app-search";
import type { CountryCode } from "@/lib/apple-charts";
import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";
import type { SearchResultWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";

import "@/styles/trackapp-apptracker-liquid-search.css";
import "@/styles/tracker-search-bar.css";

type Props = Readonly<{
  initialQuery: string;
  initialResults: SearchResultWithTrackappMetrics[];
  country: CountryCode;
  favoritesEnabled?: boolean;
  favoriteAppIds?: string[];
  syncUrl?: boolean;
  syncUrlPath?: string;
}>;

export function TrackappApptrackerLiveSearch({
  initialQuery,
  initialResults,
  country,
  favoritesEnabled = false,
  favoriteAppIds = [],
  syncUrl = false,
  syncUrlPath = TRACKAPP_ACCUEIL_BASE,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const favSet = new Set(favoriteAppIds);
  const { query, setQuery, debouncedQ, results, loading, showResults, showHint } = useTrackappLiveAppSearch({
    country,
    initialQuery,
    initialResults,
    syncUrl,
    syncUrlPath,
  });

  const onFormMouseDown = (e: React.MouseEvent<HTMLFormElement>) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, button")) return;
    e.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="trackapp-accueil-live-search w-full min-w-0">
      <div className="trackapp-apptracker-liquid-search">
        <div className="trackapp-apptracker-liquid-search__stage">
          <div
            className="tracker-switcher-host trackapp-accueil-search-host w-full min-w-0"
            data-search-surface="light"
          >
            <div className="tracker-search-desktop-host w-full">
              <div className="tracker-search-stack tracker-search-stack--desktop w-full">
                <form
                  role="search"
                  className="tracker-search-pill trackapp-apptracker-liquid-search__form"
                  autoComplete="off"
                  onSubmit={(e) => e.preventDefault()}
                  onMouseDown={onFormMouseDown}
                >
                  <svg
                    className="tracker-search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={inputRef}
                    id={inputId}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    inputMode="search"
                    enterKeyHint="search"
                    className="tracker-search-input"
                    placeholder="Rechercher une app…"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-label="Rechercher une app"
                    aria-busy={loading}
                  />
                  {loading ? (
                    <span
                      className="trackapp-accueil-live-search__spinner shrink-0"
                      role="status"
                      aria-label="Recherche en cours"
                    />
                  ) : null}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showHint ? (
        <p className="mt-3 text-center text-[0.85rem] text-[var(--dash-muted-light)]">
          Tape au moins {TRACKAPP_SEARCH_MIN_QUERY_LEN} caractères pour lancer la recherche.
        </p>
      ) : null}
      {showResults ? (
        <section className="trackapp-accueil-live-search__results mt-2 w-full min-w-0">
          <div className="mb-4">
            <h2 className="m-0 text-[1.35rem] font-bold tracking-tight text-[var(--dash-text)]">
              Résultats pour &ldquo;{debouncedQ}&rdquo;
            </h2>
            <p className="mt-1 text-[0.9rem] text-[var(--dash-muted-light)]">
              {loading ? "Recherche…" : `${results.length} résultat${results.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {loading && results.length === 0 ? (
            <div className="grid w-full min-w-0 gap-3" aria-hidden>
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-[7.5rem] animate-pulse rounded-[22px] border border-[var(--dash-border)] bg-slate-100"
                />
              ))}
            </div>
          ) : null}
          {!loading && results.length > 0 ? (
            <ul className="m-0 grid w-full min-w-0 list-none gap-3 p-0">
              {results.map((app) => (
                <li key={app.id} className="min-w-0">
                  {favoritesEnabled ? (
                    <TrackappAppFavoriteRow
                      appId={app.id}
                      initialFavorite={favSet.has(app.id)}
                      favoritesEnabled={favoritesEnabled}
                    >
                      <TrackappApptrackerAppResultCard app={app} country={country} metrics={app.trackappMetrics} />
                    </TrackappAppFavoriteRow>
                  ) : (
                    <TrackappApptrackerAppResultCard app={app} country={country} metrics={app.trackappMetrics} />
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          {!loading && results.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white py-16 text-center text-[var(--dash-muted-light)]">
              Aucun résultat. Essaie un nom plus précis.
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
