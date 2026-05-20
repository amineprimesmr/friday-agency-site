"use client";

import { useMemo, useState } from "react";

import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import { useTrackappLiveAppSearch } from "@/hooks/use-trackapp-live-app-search";
import type { CountryCode } from "@/lib/apple-charts";
import type { TrackappSearchSort } from "@/lib/trackapp-smart-search/rank-results";
import { cn } from "@/lib/utils";

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
  const search = useTrackappLiveAppSearch({
    country,
    initialQuery,
    syncUrl: true,
    sort,
  });

  const metaLine = useMemo(() => {
    if (!search.showResults || search.loading) return null;
    if (search.results.length === 0) return "Aucun résultat — essayez un autre mot-clé (ex. sport, fitness, tiktok).";
    return `${String(search.results.length)} app${search.results.length > 1 ? "s" : ""} — tri par ${
      SORT_OPTIONS.find((o) => o.id === sort)?.label ?? sort
    }`;
  }, [search.showResults, search.loading, search.results.length, sort]);

  return (
    <div className="trackapp-accueil-intelligent">
      <div className="trackapp-accueil-intelligent__search">
        <label className="sr-only" htmlFor="trackapp-accueil-q">
          Rechercher une application
        </label>
        <input
          id="trackapp-accueil-q"
          type="search"
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          placeholder="Sport, fitness, TikTok growth, budget…"
          className="trackapp-accueil-intelligent__input"
          autoComplete="off"
          spellCheck={false}
        />
        {search.query ? (
          <button type="button" className="trackapp-accueil-intelligent__clear" onClick={search.reset}>
            Effacer
          </button>
        ) : null}
      </div>

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

      {search.showHint ? (
        <p className="trackapp-accueil-intelligent__hint">Saisissez au moins 2 caractères.</p>
      ) : null}

      {search.showResults ? (
        <div className="trackapp-accueil-intelligent__results">
          {metaLine ? <p className="trackapp-accueil-intelligent__meta">{metaLine}</p> : null}
          {search.loading ? (
            <div className="trackapp-accueil-intelligent__skeleton" aria-hidden>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="trackapp-accueil-intelligent__skeleton-card" />
              ))}
            </div>
          ) : (
            <ul className="trackapp-accueil-intelligent__list">
              {search.results.map((app) => (
                <li key={app.id}>
                  <TrackappApptrackerAppResultCard
                    app={app}
                    country={country}
                    metrics={app.trackappMetrics}
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
