"use client";

import { TrackerSearchBar } from "@/components/tracker/tracker-search-bar";
import type { CountryCode } from "@/lib/apple-charts";

import "@/styles/tracker-search-bar.css";
import "@/styles/trackapp-accueil-search.css";

type Props = Readonly<{
  country: CountryCode;
  initialQuery?: string;
}>;

/** Recherche Accueil — même composant et API que la landing (`/tracker`). */
export function TrackappAccueilSearch({ country, initialQuery = "" }: Props) {
  return (
    <div className="trackapp-accueil-search w-full min-w-0">
      <TrackerSearchBar
        searchSurface="light"
        isOpen
        embedded
        country={country}
        initialQuery={initialQuery}
        onClose={() => undefined}
        onOpen={() => undefined}
      />
    </div>
  );
}
