"use client";

import Image from "next/image";
import { TrackerNavLink, useTrackerNavStart } from "@/components/tracker/tracker-navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import "@/styles/tracker-search-bar.css";

import { COUNTRY_MAP, TRACKER_DEFAULT_COUNTRY } from "@/lib/apple-charts";

export type TrackerSearchSurface = "dark" | "light";

const trackerSearchStoreCc = TRACKER_DEFAULT_COUNTRY.toUpperCase();
const trackerSearchCountryName = COUNTRY_MAP[TRACKER_DEFAULT_COUNTRY].name;

export type FeaturedAppLite = {
  id: string;
  name: string;
  artistName: string;
  category: string;
  categoryId: string;
  artworkUrl: string;
  rank: number;
  releaseDate: string;
  dlEst: string;
};

type SearchHit = {
  id: string;
  name: string;
  artistName: string;
  category: string;
  categoryId: string;
  artworkUrl: string;
  rank: number;
  releaseDate: string;
  dlEst: string;
  releaseLine: string;
  rating: number;
  langLabel: string;
};

function formatReleaseMeta(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days >= 0 && days < 14) {
    if (days === 0) return "Màj récente";
    if (days === 1) return "Il y a 1 jour";
    return `Il y a ${String(days)} jours`;
  }
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function categorySlug(cat: string) {
  if (!cat) return "";
  const c = cat.toLowerCase();
  return c.length > 26 ? `${c.slice(0, 24)}…` : c;
}

function calendarShort(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

const SEARCH_DEBOUNCE_MS = 200;
const SKELETON_ROWS = 6;

export function TrackerSearchBar({
  searchSurface = "dark",
  isOpen,
  onClose,
  onOpen,
}: {
  searchSurface?: TrackerSearchSurface;
  isOpen: boolean;
  onClose: () => void;
  /** Ouvre le panneau (desktop : au focus de l’input). */
  onOpen?: () => void;
}) {
  const router = useRouter();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useReducedMotion();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const startTrackerNav = useTrackerNavStart();

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featured, setFeatured] = useState<FeaturedAppLite[]>([]);
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const featuredSorted = useMemo(
    () => [...featured].sort((a, b) => a.rank - b.rank),
    [featured],
  );

  const trimmed = query.trim();
  const debounceWaiting =
    trimmed.length >= 1 && trimmed !== debouncedQ;
  const showSearchSkeleton =
    trimmed.length >= 1 && (debounceWaiting || searchLoading);
  const showSearchResults =
    trimmed.length >= 1 && !showSearchSkeleton;
  const showEmptySearch =
    showSearchResults && searchHits.length === 0;

  const navigIds = useMemo(() => {
    if (trimmed.length >= 1) {
      if (showSearchSkeleton || showEmptySearch) return [];
      return searchHits.map((h) => h.id);
    }
    return featuredSorted.map((a) => a.id);
  }, [
    trimmed.length,
    showSearchSkeleton,
    showEmptySearch,
    searchHits,
    featuredSorted,
  ]);

  const navigIdsKey = navigIds.join("|");

  const loadFeatured = useCallback(async () => {
    setFeaturedLoading(true);
    try {
      const res = await fetch("/api/tracker/featured-apps", {
        cache: "force-cache",
      });
      const data = (await res.json()) as { apps?: FeaturedAppLite[] };
      setFeatured(Array.isArray(data.apps) ? data.apps : []);
    } catch {
      setFeatured([]);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen && featured.length === 0) return;
    if (featured.length > 0) return;
    void loadFeatured();
  }, [featured.length, isOpen, loadFeatured]);

  useEffect(() => {
    const t = trimmed;
    if (!t) {
      setDebouncedQ("");
      return;
    }
    const id = window.setTimeout(() => setDebouncedQ(t), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query, trimmed]);

  useEffect(() => {
    if (!debouncedQ) {
      setSearchHits([]);
      setSearchLoading(false);
      return;
    }
    const ac = new AbortController();
    setSearchLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/tracker/search?q=${encodeURIComponent(debouncedQ)}&country=${TRACKER_DEFAULT_COUNTRY}&limit=12`,
          { signal: ac.signal, cache: "force-cache" },
        );
        const data = (await res.json()) as { apps?: SearchHit[] };
        if (!ac.signal.aborted) {
          setSearchHits(Array.isArray(data.apps) ? data.apps : []);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (!ac.signal.aborted) setSearchHits([]);
      } finally {
        if (!ac.signal.aborted) setSearchLoading(false);
      }
    })();
    return () => ac.abort();
  }, [debouncedQ]);

  useEffect(() => {
    setHighlight(0);
  }, [navigIdsKey, trimmed, showSearchSkeleton, showEmptySearch]);

  useEffect(() => {
    if (navigIds.length === 0) return;
    if (highlight > navigIds.length - 1) {
      setHighlight(Math.max(0, navigIds.length - 1));
    }
  }, [navigIds.length, highlight]);

  useEffect(() => {
    if (!isOpen) return;
    let el: HTMLElement | null = null;
    if (trimmed.length >= 1 && !showSearchSkeleton && !showEmptySearch && searchHits.length > 0) {
      el = document.getElementById(`${listId}-nav-s-${String(highlight)}`);
    } else if (trimmed.length < 1 && !featuredLoading && featuredSorted.length > 0) {
      el = document.getElementById(`${listId}-nav-f-${String(highlight)}`);
    }
    el?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [
    highlight,
    listId,
    isOpen,
    trimmed,
    showSearchSkeleton,
    showEmptySearch,
    searchHits.length,
    featuredLoading,
    featuredSorted.length,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const root = isLg ? stackRef.current : mobileSheetRef.current;
      if (!root?.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isOpen, onClose, isLg]);

  useEffect(() => {
    if (isLg || !isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isLg, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  function submitSearch() {
    const q = trimmed;
    if (!q) {
      startTrackerNav?.();
      router.push(`/tracker/search?country=${TRACKER_DEFAULT_COUNTRY}`);
      onClose();
      return;
    }
    startTrackerNav?.();
    router.push(`/tracker/search?q=${encodeURIComponent(q)}&country=${TRACKER_DEFAULT_COUNTRY}`);
    onClose();
  }

  function goHit(href: string) {
    onClose();
    startTrackerNav?.();
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    const n = navigIds.length;
    if (n === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitSearch();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, n - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (trimmed.length >= 1 && !showSearchSkeleton && !showEmptySearch) {
        const hit = searchHits[highlight];
        if (hit) goHit(`/tracker/apps/${hit.id}?country=${TRACKER_DEFAULT_COUNTRY}`);
      } else if (trimmed.length < 1) {
        const app = featuredSorted[highlight];
        if (app) goHit(`/tracker/apps/${app.id}?country=${TRACKER_DEFAULT_COUNTRY}`);
      } else {
        submitSearch();
      }
    }
  }

  if (!isLg && !isOpen) {
    return null;
  }

  const searchStack = (
        <div
          ref={isLg ? stackRef : undefined}
          className={
            isLg
              ? "tracker-search-stack tracker-search-stack--desktop tracker-switcher-host w-full"
              : cn(
                  "tracker-search-stack tracker-search-stack--mobile-takeover tracker-switcher-host",
                  "w-full min-h-0",
                )
          }
          data-search-surface={searchSurface}
        >
          <form
            role="search"
            className="tracker-search-pill"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            onMouseDown={(e) => {
              if (!isLg || e.button !== 0) return;
              const t = e.target as HTMLElement;
              if (t.closest("input")) return;
              e.preventDefault();
              inputRef.current?.focus({ preventScroll: true });
            }}
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
              id="tracker-search-combobox"
              type="text"
              name="tracker-app-search"
              inputMode="search"
              enterKeyHint="search"
              role="combobox"
              className="tracker-search-input"
              placeholder={isLg && !isOpen ? "Rechercher…" : "Rechercher une app…"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-controls={isOpen ? "tracker-search-panel" : undefined}
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                if (v.trim().length >= 1) setSearchLoading(true);
                else {
                  setSearchHits([]);
                  setSearchLoading(false);
                }
              }}
              onFocus={() => {
                onOpen?.();
              }}
              onKeyDown={onInputKeyDown}
            />
            {!isLg ? (
              <button
                type="button"
                className="tracker-search-pill-dismiss"
                onClick={() => onClose()}
                aria-label="Fermer la recherche"
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

          {isOpen ? (
          <div
            id="tracker-search-panel"
            role="region"
            aria-label="Recherche App Store"
            className="tracker-search-panel tracker-search-panel--dark"
          >
              <div role="list" className="min-h-0">
                {showSearchSkeleton
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <div
                        key={`sk-${String(i)}`}
                        role="presentation"
                        className="tracker-search-row tracker-search-row--skeleton"
                      >
                        <div className="tracker-search-row-art tracker-search-skel-icon" />
                        <div className="tracker-search-row-main flex-1 space-y-2 py-0.5">
                          <div className="tracker-search-skel-line w-[72%]" />
                          <div className="tracker-search-skel-line w-[48%] opacity-70" />
                          <div className="flex gap-2 pt-1">
                            <div className="tracker-search-skel-pill w-14" />
                            <div className="tracker-search-skel-pill w-24 opacity-80" />
                          </div>
                          <div className="tracker-search-skel-line w-[55%] opacity-50" />
                        </div>
                        <div className="tracker-search-stat-col items-end gap-1.5 py-0.5">
                          <div className="tracker-search-skel-line w-14" />
                          <div className="tracker-search-skel-line w-10 opacity-60" />
                        </div>
                      </div>
                    ))
                  : null}

                {showEmptySearch ? (
                  <p className="px-4 py-10 text-center text-sm text-zinc-500">
                    Aucun résultat pour « {trimmed} »
                  </p>
                ) : null}

                {!showSearchSkeleton &&
                showSearchResults &&
                searchHits.map((app, idx) => {
                  const chips = [
                    app.langLabel,
                    categorySlug(app.category),
                  ].filter(Boolean);
                  const timeLine = app.releaseLine || formatReleaseMeta(app.releaseDate);
                  const dateCal = calendarShort(app.releaseDate);
                  const ratingStr =
                    app.rating > 0 ? app.rating.toFixed(1) : "—";
                  const selected = idx === highlight;

                  return (
                    <TrackerNavLink
                      key={app.id}
                      id={`${listId}-nav-s-${String(idx)}`}
                      role="listitem"
                      href={`/tracker/apps/${app.id}?country=${TRACKER_DEFAULT_COUNTRY}`}
                      className={`tracker-search-row tracker-search-row--dark tracker-touch ${selected ? "tracker-search-row--active" : "tracker-rise"}`}
                      style={
                        selected
                          ? undefined
                          : { animationDelay: `${Math.min(idx, 12) * 22}ms` }
                      }
                      prefetchOnHover={idx < 6}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => onClose()}
                    >
                      <div className="tracker-search-row-art relative bg-zinc-800">
                        {app.artworkUrl ? (
                          <Image
                            src={app.artworkUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="52px"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-500">
                            {app.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="tracker-search-row-main tracker-search-row-main--grow min-w-0">
                        <div className="tracker-search-row-headline">
                          <div className="min-w-0">
                            <div className="tracker-search-row-title tracker-search-row-title--dark">
                              {app.name}
                            </div>
                            <div className="tracker-search-row-dev tracker-search-row-dev--dark">
                              {app.artistName}
                            </div>
                          </div>
                          <div className="tracker-search-row-badges">
                            {chips.map((c, chipIdx) => (
                              <span key={`${String(chipIdx)}-${c}`} className="tracker-search-chip tracker-search-chip--dark">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="tracker-search-meta tracker-search-meta--dark">
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden>🕐</span>
                            {timeLine || " — "}
                          </span>
                          <span className="inline-flex items-center gap-1 opacity-90">
                            <span aria-hidden>📅</span>
                            {dateCal || " — "}
                          </span>
                        </div>
                      </div>

                      <div className="tracker-search-stat-col tracker-search-stat-col--dark">
                        <div className="tracker-search-stat-num tracker-search-stat-num--dark">
                          {app.dlEst}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs font-semibold tabular-nums text-white/88">
                          <span>{ratingStr}</span>
                          <span className="text-amber-400" aria-hidden>
                            ★
                          </span>
                        </div>
                        <div className="tracker-search-stat-sub tracker-search-stat-sub--dark">
                          Tél. estimés
                        </div>
                      </div>

                      <span className="tracker-search-chevron tracker-search-chevron--dark" aria-hidden>
                        ›
                      </span>
                    </TrackerNavLink>
                  );
                })}

                {!showSearchSkeleton && trimmed.length < 1 ? (
                  <>
                    {featuredLoading && featuredSorted.length === 0
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={`fsk-${String(i)}`}
                            role="presentation"
                            className="tracker-search-row tracker-search-row--skeleton"
                          >
                            <div className="tracker-search-row-art tracker-search-skel-icon" />
                            <div className="tracker-search-row-main flex-1 space-y-2 py-0.5">
                              <div className="tracker-search-skel-line w-[68%]" />
                              <div className="tracker-search-skel-line w-[44%] opacity-70" />
                            </div>
                          </div>
                        ))
                      : null}

                    {!featuredLoading && featuredSorted.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-zinc-500">
                        Aucune suggestion pour le moment.
                      </p>
                    ) : null}

                    {featuredSorted.map((app, idx) => {
                      const chips = [`${trackerSearchStoreCc} · #${String(app.rank)}`, categorySlug(app.category)].filter(
                        Boolean,
                      );
                      const meta = formatReleaseMeta(app.releaseDate);
                      const selected = idx === highlight;

                      return (
                        <TrackerNavLink
                          key={`${app.id}-f-${String(idx)}`}
                          id={`${listId}-nav-f-${String(idx)}`}
                          role="listitem"
                          href={`/tracker/apps/${app.id}?country=${TRACKER_DEFAULT_COUNTRY}`}
                          className={`tracker-search-row tracker-search-row--dark tracker-touch ${selected ? "tracker-search-row--active" : "tracker-rise"}`}
                          style={
                            selected
                              ? undefined
                              : { animationDelay: `${Math.min(idx, 12) * 28}ms` }
                          }
                          prefetchOnHover={idx < 4}
                          onMouseEnter={() => setHighlight(idx)}
                          onClick={() => onClose()}
                        >
                          <div className="tracker-search-row-art relative bg-zinc-800">
                            {app.artworkUrl ? (
                              <Image
                                src={app.artworkUrl}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="52px"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-500">
                                {app.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="tracker-search-row-main">
                            <div className="tracker-search-row-title tracker-search-row-title--dark">
                              {app.name}
                            </div>
                            <div className="tracker-search-row-dev tracker-search-row-dev--dark">
                              {app.artistName}
                            </div>
                            <div className="tracker-search-row-tags">
                              {chips.map((c) => (
                                <span key={c} className="tracker-search-chip tracker-search-chip--dark">
                                  {c}
                                </span>
                              ))}
                            </div>
                            <div className="tracker-search-meta tracker-search-meta--dark">
                              <span className="inline-flex items-center gap-1">
                                <span aria-hidden>📅</span>
                                {meta || " — "}
                              </span>
                              <span className="inline-flex items-center gap-1 opacity-85">
                                <span aria-hidden>⬇</span>
                                Tél. estimés
                              </span>
                            </div>
                          </div>

                          <div className="tracker-search-stat-col tracker-search-stat-col--dark">
                            <div className="tracker-search-stat-num tracker-search-stat-num--dark">
                              {app.dlEst}
                            </div>
                            <div className="tracker-search-stat-sub tracker-search-stat-sub--dark">
                              / mois · {trackerSearchCountryName}
                            </div>
                          </div>

                          <span className="tracker-search-chevron tracker-search-chevron--dark" aria-hidden>
                            ›
                          </span>
                        </TrackerNavLink>
                      );
                    })}
                  </>
                ) : null}
              </div>

              <div className="tracker-search-panel-footer tracker-search-panel-footer--dark">
                <div className="tracker-search-kbd-hints hidden lg:flex">
                  <span className="tracker-kbd-group">
                    <kbd className="tracker-kbd">↑</kbd>
                    <kbd className="tracker-kbd">↓</kbd>
                    <span>naviguer</span>
                  </span>
                  <span className="tracker-kbd-group">
                    <kbd className="tracker-kbd">ret</kbd>
                    <span>ouvrir</span>
                  </span>
                  <span className="tracker-kbd-group">
                    <kbd className="tracker-kbd">esc</kbd>
                    <span>fermer</span>
                  </span>
                </div>
                <TrackerNavLink
                  href={`/tracker/search?country=${TRACKER_DEFAULT_COUNTRY}`}
                  className="tracker-search-advanced-link"
                  onClick={() => onClose()}
                >
                  Recherche avancée →
                </TrackerNavLink>
              </div>
          </div>
          ) : null}
        </div>
  );

  if (isLg) {
    return <div className="tracker-search-desktop-host">{searchStack}</div>;
  }

  const sheetEase = reduceMotion
    ? { duration: 0.14 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.78 };
  const sheetEnter = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -26, scale: 0.966 };
  const sheetExit = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -16, scale: 0.978 };
  const fadeEase = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return createPortal(
    <AnimatePresence mode="sync">
      {isOpen ? (
        <>
          <motion.button
            key="tracker-msearch-backdrop"
            type="button"
            aria-hidden
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeEase}
            className="tracker-mobile-search-backdrop-fixed"
            onClick={() => onClose()}
          />

          <motion.div
            ref={mobileSheetRef}
            key="tracker-msearch-sheet"
            id="tracker-search-popover"
            role="dialog"
            aria-modal="true"
            aria-label="Rechercher dans le tracker"
            layout={false}
            initial={sheetEnter}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={sheetExit}
            transition={sheetEase}
            className="tracker-mobile-search-sheet-fixed"
          >
            <div className="tracker-mobile-search-body">{searchStack}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
