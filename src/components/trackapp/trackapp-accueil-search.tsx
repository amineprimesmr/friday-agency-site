"use client";

import Image from "next/image";
import Link from "next/link";

import { TrackerSearchBar } from "@/components/tracker/tracker-search-bar";
import { useTrackappSearchHistory } from "@/hooks/use-trackapp-search-history";
import type { CountryCode } from "@/lib/apple-charts";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";

import "@/styles/tracker-search-bar.css";
import "@/styles/trackapp-accueil-search.css";

type Props = Readonly<{
  country: CountryCode;
  initialQuery?: string;
}>;

/** Accueil — recherche mots-clés (API landing) + historique 5 apps sous la barre (style Trendtrack). */
export function TrackappAccueilSearch({ country, initialQuery = "" }: Props) {
  const history = useTrackappSearchHistory(country);
  const recent = history.entries.slice(0, 5);

  return (
    <div className="trackapp-accueil-search trackapp-accueil-search-host w-full min-w-0" data-search-surface="light">
      <TrackerSearchBar
        searchSurface="light"
        isOpen={false}
        embedded
        hideFeaturedWhenEmpty
        trackappLiveMetrics
        country={country}
        initialQuery={initialQuery}
        onClose={() => undefined}
        onOpen={() => undefined}
        onNavigateToApp={(app) => history.recordApp(app)}
      />

      {recent.length > 0 ? (
        <div className="trackapp-accueil-recent" aria-label="Dernières apps consultées">
          <div className="trackapp-accueil-recent__chips">
            {recent.map((entry) => (
              <Link
                key={`${entry.country}:${entry.id}`}
                href={trackappAccueilAppHref(entry.id, entry.country)}
                className="trackapp-accueil-recent__chip"
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
                <span className="trackapp-accueil-recent__chip-icon">
                  {entry.artworkUrl ? (
                    <Image src={entry.artworkUrl} alt="" fill sizes="32px" className="object-cover" />
                  ) : (
                    <span aria-hidden>{entry.name.charAt(0)}</span>
                  )}
                </span>
                <span className="trackapp-accueil-recent__chip-label">{entry.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
