import { TrackappApptrackerLiveSearch } from "@/components/trackapp/trackapp-apptracker-live-search";
import type { CountryCode } from "@/lib/apple-charts";
import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";
import type { SearchResultWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";

type Props = Readonly<{
  q: string;
  country: CountryCode;
  results: SearchResultWithTrackappMetrics[];
  favoritesEnabled?: boolean;
  favoriteAppIds?: string[];
  syncUrlPath?: string;
}>;

export function TrackappApptrackerSearchSection({
  q,
  country,
  results,
  favoritesEnabled = false,
  favoriteAppIds = [],
  syncUrlPath = TRACKAPP_ACCUEIL_BASE,
}: Props) {
  return (
    <TrackappApptrackerLiveSearch
      initialQuery={q}
      initialResults={results}
      country={country}
      favoritesEnabled={favoritesEnabled}
      favoriteAppIds={favoriteAppIds}
      syncUrl
      syncUrlPath={syncUrlPath}
    />
  );
}
