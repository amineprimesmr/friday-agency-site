"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef } from "react";

import {
  TRACKAPP_SEARCH_MIN_QUERY_LEN,
  useTrackappLiveAppSearch,
} from "@/hooks/use-trackapp-live-app-search";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { trackappApptrackerAppHref } from "@/lib/trackapp-apptracker-paths";
import { TRACKAPP_APPTRACKER_SEARCH_EXAMPLES } from "@/lib/trackapp-apptracker-search";

export function TrackappTopbarSearchModal({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const searchParams = useSearchParams();
  const country = normalizeTrackerCountryParam(searchParams.get("country") ?? undefined);

  const id = useId();
  const titleId = `app-topbar-search-title-${id}`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { query, setQuery, debouncedQ, results, loading, showResults, showHint, reset } =
    useTrackappLiveAppSearch({
      country,
      enabled: open,
    });

  useEffect(() => {
    if (!open) {
      reset();
      return undefined;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open, reset]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onPick = useCallback(() => {
    onClose();
    reset();
  }, [onClose, reset]);

  const showEmpty = !showResults && !showHint && !loading;
  const showNoResults = showResults && !loading && results.length === 0;

  return (
    <div
      className={open ? "app-topbar-search-root is-visible" : "app-topbar-search-root"}
      id="app-topbar-search-root"
      aria-hidden={!open}
    >
      <div
        className="app-topbar-search-backdrop"
        id="app-topbar-search-backdrop"
        role="presentation"
        onClick={onClose}
      />
      <div
        className="app-topbar-search-modal"
        id="app-topbar-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 className="visually-hidden" id={titleId}>
          Recherche App Store
        </h2>
        <div className="app-topbar-search-field-wrap">
          <span className="app-topbar-search-field-ico" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            id="app-topbar-search-input"
            className="app-topbar-search-input"
            placeholder="Rechercher une app…"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-autocomplete="list"
            aria-controls="app-topbar-search-results"
            aria-busy={loading}
          />
          {loading ? (
            <span className="app-topbar-search-spinner" role="status" aria-label="Recherche en cours" />
          ) : null}
          <button type="button" className="app-topbar-search-filter" aria-label="Filtres" title="Bientôt" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>
        </div>

        {showEmpty ? (
          <div className="app-topbar-search-chips" id="app-topbar-search-chips" role="tablist" aria-label="Exemples">
            {TRACKAPP_APPTRACKER_SEARCH_EXAMPLES.map((term) => (
              <button key={term} type="button" className="app-topbar-search-chip" onClick={() => setQuery(term)}>
                {term}
              </button>
            ))}
          </div>
        ) : null}

        <div className="app-topbar-search-body">
          {showHint ? (
            <p className="app-topbar-search-hint">
              Tape au moins {TRACKAPP_SEARCH_MIN_QUERY_LEN} caractères pour lancer la recherche.
            </p>
          ) : null}

          {showResults && loading && results.length === 0 ? (
            <ul className="app-topbar-search-results" id="app-topbar-search-results" role="listbox" aria-label="Résultats">
              {Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="app-topbar-search-result-skeleton" aria-hidden="true" />
              ))}
            </ul>
          ) : null}

          {showResults && results.length > 0 ? (
            <>
              <p className="app-topbar-search-results-meta">
                {loading ? "Recherche…" : `${results.length} résultat${results.length === 1 ? "" : "s"}`}
              </p>
              <ul className="app-topbar-search-results" id="app-topbar-search-results" role="listbox" aria-label="Résultats">
                {results.map((app) => (
                  <li key={app.id} role="option">
                    <Link
                      href={trackappApptrackerAppHref(app.id, country)}
                      className="app-topbar-search-result"
                      onClick={onPick}
                    >
                      <span className="app-topbar-search-result-art">
                        {app.artworkUrl ? (
                          <Image src={app.artworkUrl} alt="" width={40} height={40} className="object-cover" />
                        ) : (
                          <span className="app-topbar-search-result-art-fallback">{app.name.charAt(0)}</span>
                        )}
                      </span>
                      <span className="app-topbar-search-result-copy">
                        <span className="app-topbar-search-result-label">{app.name}</span>
                        <span className="app-topbar-search-result-sub">{app.artistName}</span>
                      </span>
                      <span className="app-topbar-search-result-meta">
                        {app.category || "App"}
                        {app.averageUserRating > 0 ? ` · ★ ${app.averageUserRating.toFixed(1)}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {showNoResults ? (
            <div className="app-topbar-search-empty" id="app-topbar-search-empty">
              <p className="app-topbar-search-empty-text">
                Aucun résultat pour &ldquo;{debouncedQ}&rdquo;. Essaie un autre nom.
              </p>
            </div>
          ) : null}

          {showEmpty ? (
            <div className="app-topbar-search-empty" id="app-topbar-search-empty">
              <div className="app-topbar-search-empty-ico" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <p className="app-topbar-search-empty-text" id="app-topbar-search-empty-text">
                Les résultats s&apos;affichent ici au fil de la saisie — sur l&apos;Accueil.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
