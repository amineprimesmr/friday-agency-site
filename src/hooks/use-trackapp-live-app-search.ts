"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CountryCode } from "@/lib/apple-charts";
import type { SearchResultWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";
import { abortInFlightRequest, isAbortError } from "@/lib/abort-signal";
import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";
import type { TrackappSearchSort } from "@/lib/trackapp-smart-search/rank-results";

export const TRACKAPP_SEARCH_DEBOUNCE_MS = 160;
export const TRACKAPP_SEARCH_MIN_QUERY_LEN = 2;

type Options = Readonly<{
  country: CountryCode;
  initialQuery?: string;
  initialResults?: SearchResultWithTrackappMetrics[];
  sort?: TrackappSearchSort;
  /** Met à jour l’URL avec `?q=` — désactivé dans la modale ⌘K. */
  syncUrl?: boolean;
  /** Chemin de liste (défaut `/trackapp/accueil`). */
  syncUrlPath?: string;
  enabled?: boolean;
}>;

export function useTrackappLiveAppSearch({
  country,
  initialQuery = "",
  initialResults = [],
  sort = "relevance",
  syncUrl = false,
  syncUrlPath = TRACKAPP_ACCUEIL_BASE,
  enabled = true,
}: Options) {
  const hydratedInitialRef = useRef(false);
  const cacheRef = useRef(new Map<string, SearchResultWithTrackappMetrics[]>());
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQ, setDebouncedQ] = useState(initialQuery.trim());
  const [results, setResults] = useState<SearchResultWithTrackappMetrics[]>(initialResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDebouncedQ("");
      return undefined;
    }
    const id = window.setTimeout(() => setDebouncedQ(trimmed), TRACKAPP_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!enabled) return undefined;

    const term = debouncedQ;
    if (!term) {
      setResults([]);
      setLoading(false);
      if (syncUrl) {
        const params = new URLSearchParams();
        params.set("country", country);
        const qs = params.toString();
        window.history.replaceState(window.history.state, "", `${syncUrlPath}?${qs}`);
      }
      return undefined;
    }
    if (term.length < TRACKAPP_SEARCH_MIN_QUERY_LEN) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    if (syncUrl) {
      const params = new URLSearchParams();
      params.set("q", term);
      params.set("country", country);
      window.history.replaceState(window.history.state, "", `${syncUrlPath}?${params.toString()}`);
    }

    const useServerSeed =
      !hydratedInitialRef.current && term === initialQuery.trim() && initialResults.length > 0;
    if (useServerSeed) {
      hydratedInitialRef.current = true;
      setResults(initialResults);
      cacheRef.current.set(`${country}:${term.toLowerCase()}`, initialResults);
      setLoading(false);
      return undefined;
    }

    const cacheKey = `${country}:${sort}:${term.toLowerCase()}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return undefined;
    }

    const ac = new AbortController();
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/trackapp/search?q=${encodeURIComponent(term)}&country=${country}&limit=24&sort=${sort}`,
          { signal: ac.signal },
        );
        const data = (await res.json()) as { apps?: SearchResultWithTrackappMetrics[] };
        if (!ac.signal.aborted) {
          const nextResults = Array.isArray(data.apps) ? data.apps : [];
          cacheRef.current.set(cacheKey, nextResults);
          setResults(nextResults);
        }
      } catch (e) {
        if (isAbortError(e) || ac.signal.aborted) return;
        setResults([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })().catch(() => undefined);

    return () => abortInFlightRequest(ac);
  }, [country, debouncedQ, enabled, initialQuery, initialResults, sort, syncUrl, syncUrlPath]);

  const trimmed = query.trim();
  const showResults = debouncedQ.length >= TRACKAPP_SEARCH_MIN_QUERY_LEN;
  const showHint = trimmed.length > 0 && trimmed.length < TRACKAPP_SEARCH_MIN_QUERY_LEN;
  const searchingNextTerm =
    enabled && trimmed.length >= TRACKAPP_SEARCH_MIN_QUERY_LEN && trimmed !== debouncedQ;

  const reset = useCallback(() => {
    setQuery("");
    setDebouncedQ("");
    setResults([]);
    setLoading(false);
    hydratedInitialRef.current = false;
  }, []);

  return {
    query,
    setQuery,
    debouncedQ,
    results,
    loading: loading || searchingNextTerm,
    showResults,
    showHint,
    reset,
  };
}
