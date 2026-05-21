"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import { useTrackappLiveAppSearch } from "@/hooks/use-trackapp-live-app-search";
import { useTrackappSearchHistory } from "@/hooks/use-trackapp-search-history";
import type { CountryCode } from "@/lib/apple-charts";
import { trackappApptrackerAppHref } from "@/lib/trackapp-apptracker-paths";
import type { TrackappSearchSort } from "@/lib/trackapp-smart-search/rank-results";
import { cn } from "@/lib/utils";

import "@/styles/tracker-search-bar.css";
import "@/styles/trackapp-accueil-intelligent-search.css";

const SORT_OPTIONS: ReadonlyArray<{ id: TrackappSearchSort; label: string }> = [
  { id: "relevance", label: "Pertinence" },
  { id: "revenue", label: "Revenus" },
  { id: "downloads", label: "Téléchargements" },
  { id: "rating", label: "Note" },
];

type Props = Readonly<{
  country: CountryCode;
  initialQuery?: string;
}>;

export function TrackappAccueilIntelligentSearch({ country, initialQuery = "" }: Props) {
  const [sort, setSort] = useState<TrackappSearchSort>("relevance");
  const history = useTrackappSearchHistory(country);
  const search = useTrackappLiveAppSearch({
    country,
    initialQuery,
    syncUrl: true,
    sort,
  });

  const hasActiveSearch = search.showResults;

  const metaLine = useMemo(() => {
    if (!hasActiveSearch || search.loading) return null;
    if (search.results.length === 0) {
      return "Aucun résultat — essayez un autre mot-clé (ex. sport, fitness, tiktok).";
    }
    return `${String(search.results.length)} app${search.results.length > 1 ? "s" : ""} — tri par ${
      SORT_OPTIONS.find((o) => o.id === sort)?.label ?? sort
    }`;
  }, [hasActiveSearch, search.loading, search.results.length, sort]);

  return (
    <div className="trackapp-accueil-intelligent">
      <div className="trackapp-accueil-search-host trackapp-accueil-intelligent__search-host">
        <div className="tracker-search-desktop-host">
          <div
            className="tracker-search-stack tracker-search-stack--desktop tracker-switcher-host w-full"
            data-search-surface="light"
          >
            <form
              role="search"
              className="tracker-search-pill"
              autoComplete="off"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="trackapp-accueil-q">
                Rechercher une application
              </label>
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
                id="trackapp-accueil-q"
                type="search"
                name="trackapp-app-search"
                inputMode="search"
                enterKeyHint="search"
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                placeholder="Sport, fitness, TikTok growth, budget…"
                className="tracker-search-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {search.query ? (
                <button
                  type="button"
                  className="tracker-search-pill-dismiss"
                  onClick={search.reset}
                  aria-label="Effacer la recherche"
                >
                  <svg
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
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </form>
          </div>
        </div>
      </div>

      {hasActiveSearch ? (
        <div className="trackapp-accueil-intelligent__filters" role="group" aria-label="Trier les résultats">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cn(
                "trackapp-accueil-intelligent__filter",
                sort === opt.id && "trackapp-accueil-intelligent__filter--active",
              )}
              onClick={() => setSort(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      {search.showHint ? (
        <p className="trackapp-accueil-intelligent__hint">Saisissez au moins 2 caractères.</p>
      ) : null}

      {!hasActiveSearch && !search.showHint ? (
        <section className="trackapp-accueil-intelligent__history" aria-label="Apps récemment consultées">
          <div className="trackapp-accueil-intelligent__history-head">
            <h2 className="trackapp-accueil-intelligent__history-title">Récemment consultées</h2>
            {history.entries.length > 0 ? (
              <button
                type="button"
                className="trackapp-accueil-intelligent__history-clear"
                onClick={history.clear}
              >
                Effacer l&apos;historique
              </button>
            ) : null}
          </div>
          {history.entries.length === 0 ? (
            <p className="trackapp-accueil-intelligent__history-empty">
              Ouvre une app depuis la recherche pour la retrouver ici.
            </p>
          ) : (
            <ul className="trackapp-accueil-intelligent__history-list">
              {history.entries.map((entry) => (
                <li key={`${entry.country}:${entry.id}`}>
                  <Link
                    href={trackappApptrackerAppHref(entry.id, entry.country)}
                    className="trackapp-accueil-intelligent__history-item"
                    onClick={() =>
                      history.recordApp({
                        id: entry.id,
                        name: entry.name,
                        artistName: entry.artistName,
                        artworkUrl: entry.artworkUrl,
                        category: entry.category,
                      })
                    }
                  >
                    <span className="trackapp-accueil-intelligent__history-icon">
                      {entry.artworkUrl ? (
                        <Image src={entry.artworkUrl} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span>{entry.name.charAt(0)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-900">{entry.name}</span>
                      <span className="block truncate text-[0.78rem] text-slate-500">{entry.artistName}</span>
                    </span>
                    <span className="trackapp-accueil-intelligent__history-chevron" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {hasActiveSearch ? (
        <div className="trackapp-accueil-intelligent__results">
          {metaLine ? <p className="trackapp-accueil-intelligent__meta">{metaLine}</p> : null}
          {search.loading ? (
            <>
              <p className="trackapp-accueil-intelligent__meta">
                Chargement des métriques (même source que la fiche app)…
              </p>
              <div className="trackapp-accueil-intelligent__skeleton" aria-hidden>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="trackapp-accueil-intelligent__skeleton-card" />
                ))}
              </div>
            </>
          ) : (
            <ul className="trackapp-accueil-intelligent__list">
              {search.results.map((app) => (
                <li key={app.id}>
                  <TrackappApptrackerAppResultCard
                    app={app}
                    country={country}
                    metrics={app.trackappMetrics}
                    onBeforeNavigate={() => history.recordApp(app)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
