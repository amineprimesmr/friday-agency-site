"use client";

import { useCallback, useEffect, useState } from "react";
import type { MetaArchivedAd } from "@/lib/meta-ad-library";

export type AdLibraryApiResponse = {
  configured: boolean;
  searchQuery: string;
  searchPageIds?: string[];
  searchMode?: "page" | "keyword";
  countries: string[];
  ads: MetaArchivedAd[];
  paging: { cursors?: { before?: string; after?: string } } | null;
  error: string | null;
  errorCode: number | null;
};

export function useMetaAdLibrary(params: {
  searchTerms: string;
  /** IDs Page Facebook (numériques) — prioritaire sur le mot-clé. */
  searchPageIds?: string[];
  countryCode: string;
  pageSize?: number;
  /** Si false, aucun fetch (permet de partager une instance depuis le parent). */
  enabled?: boolean;
}) {
  const enabled = params.enabled !== false;
  const pageSize = params.pageSize ?? 12;
  const q = params.searchTerms.trim();
  const pageKey = (params.searchPageIds ?? [])
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .slice(0, 10)
    .join(",");
  const cc = (params.countryCode || "FR").trim().toUpperCase() || "FR";

  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ads, setAds] = useState<MetaArchivedAd[]>([]);
  const [nextAfter, setNextAfter] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"page" | "keyword">("keyword");

  const fetchPage = useCallback(
    async (afterCursor?: string | null) => {
      const sp = new URLSearchParams();
      sp.set("q", q);
      sp.set("page_only", "1");
      if (pageKey) sp.set("page_ids", pageKey);
      sp.set("countries", cc);
      sp.set("limit", String(pageSize));
      if (afterCursor) sp.set("after", afterCursor);
      const res = await fetch(`/api/meta/ad-library?${sp.toString()}`);
      return (await res.json()) as AdLibraryApiResponse;
    },
    [q, pageKey, cc, pageSize],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setLoadingMore(false);
      setApiError(null);
      setAds([]);
      setNextAfter(null);
      setConfigured(true);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setApiError(null);
      setAds([]);
      setNextAfter(null);
      try {
        const json = await fetchPage();
        if (cancelled) return;
        setConfigured(json.configured);
        setApiError(json.error);
        setAds(json.ads ?? []);
        setNextAfter(json.paging?.cursors?.after ?? null);
        setSearchMode(
          json.searchMode === "page" || (Array.isArray(json.searchPageIds) && json.searchPageIds.length > 0)
            ? "page"
            : "keyword",
        );
      } catch (e) {
        if (!cancelled) {
          setApiError(e instanceof Error ? e.message : "Erreur réseau");
          setAds([]);
          setNextAfter(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage, enabled]);

  const loadMore = useCallback(async () => {
    if (!enabled || !nextAfter || loadingMore) return;
    setLoadingMore(true);
    try {
      const json = await fetchPage(nextAfter);
      setApiError(json.error);
      setAds((prev) => [...prev, ...(json.ads ?? [])]);
      setNextAfter(json.paging?.cursors?.after ?? null);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, nextAfter, loadingMore, enabled]);

  return {
    loading,
    loadingMore,
    configured,
    apiError,
    ads,
    nextAfter,
    loadMore,
    searchMode,
    refetchKey: `${pageKey}|${q}|${cc}|${pageSize}`,
  };
}

export type MetaAdLibraryState = ReturnType<typeof useMetaAdLibrary>;
