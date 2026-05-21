"use client";

import { useCallback, useEffect, useState } from "react";

import type { CountryCode, SearchResult } from "@/lib/apple-charts";
import {
  clearTrackappSearchHistory,
  pushTrackappSearchHistoryApp,
  readTrackappSearchHistory,
  type TrackappSearchHistoryEntry,
} from "@/lib/trackapp-search-history";

export function useTrackappSearchHistory(country: CountryCode) {
  const [entries, setEntries] = useState<TrackappSearchHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(readTrackappSearchHistory());
  }, []);

  const recordApp = useCallback(
    (app: Pick<SearchResult, "id" | "name" | "artistName" | "artworkUrl" | "category">) => {
      const next = pushTrackappSearchHistoryApp(app, country);
      setEntries(next);
    },
    [country],
  );

  const clear = useCallback(() => {
    clearTrackappSearchHistory();
    setEntries([]);
  }, []);

  const forCountry = entries.filter((e) => e.country === country);

  return { entries: forCountry, recordApp, clear };
}
