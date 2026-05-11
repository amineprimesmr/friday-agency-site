"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import "@/styles/tracker-search-bar.css";

export type TrackerSearchSurface = "dark" | "light";

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

function formatReleaseMeta(raw: string) {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days >= 0 && days < 14) {
    if (days === 0) return "Màj récente";
    if (days === 1) return "Il y a 1 jour";
    return `Il y a ${days} jours`;
  }
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function categorySlugFr(cat: string) {
  if (!cat) return "";
  const c = cat.toLowerCase();
  return c.length > 26 ? `${c.slice(0, 24)}…` : c;
}

export function TrackerSearchBar({
  searchSurface = "dark",
}: {
  searchSurface?: TrackerSearchSurface;
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<FeaturedAppLite[]>([]);

  const featuredSorted = useMemo(
    () => [...featured].sort((a, b) => a.rank - b.rank),
    [featured],
  );

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tracker/featured-apps");
      const data = (await res.json()) as { apps?: FeaturedAppLite[] };
      setFeatured(Array.isArray(data.apps) ? data.apps : []);
    } catch {
      setFeatured([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const stack = stackRef.current;
      if (!stack?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  function submitSearch() {
    const q = query.trim();
    if (!q) {
      router.push("/tracker/search?country=us");
      setOpen(false);
      return;
    }
    router.push(
      `/tracker/search?q=${encodeURIComponent(q)}&country=us`,
    );
    setOpen(false);
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          className="tracker-search-backdrop"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="tracker-search-fixed">
        <div
          ref={stackRef}
          className="tracker-search-stack tracker-switcher-host"
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
              id={listId}
              type="text"
              name="tracker-app-search"
              inputMode="search"
              enterKeyHint="search"
              role="combobox"
              className="tracker-search-input"
              placeholder="Rechercher une app…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-expanded={open}
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-controls={open ? `${listId}-panel` : undefined}
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          {open ? (
            <div
              id={`${listId}-panel`}
              role="region"
              aria-label="Suggestions App Store — États-Unis · top gratuit"
              className="tracker-search-panel"
            >
              <div role="list" className="min-h-0">
                {loading && featuredSorted.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={`sk-${String(i)}`}
                        role="presentation"
                        className="tracker-search-row animate-pulse"
                      >
                        <div className="tracker-search-row-art bg-zinc-200/90" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 w-[70%] rounded bg-zinc-200/90" />
                          <div className="h-3 w-[45%] rounded bg-zinc-200/60" />
                        </div>
                      </div>
                    ))
                  : null}

                {!loading && featuredSorted.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-zinc-500">
                    Aucune suggestion pour le moment.
                  </p>
                ) : null}

                {featuredSorted.map((app, idx) => {
                  const chips = [`US · #${app.rank}`, categorySlugFr(app.category)]
                    .filter(Boolean);
                  const meta = formatReleaseMeta(app.releaseDate);

                  return (
                    <Link
                      key={`${app.id}-${String(idx)}`}
                      role="listitem"
                      href={`/tracker/apps/${app.id}?country=us`}
                      className="tracker-search-row tracker-touch tracker-rise"
                      style={{ animationDelay: `${Math.min(idx, 12) * 28}ms` }}
                      prefetch={idx < 4}
                      onClick={() => setOpen(false)}
                    >
                      <div className="tracker-search-row-art relative bg-white">
                        {app.artworkUrl ? (
                          <Image
                            src={app.artworkUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="52px"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-300">
                            {app.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="tracker-search-row-main">
                        <div className="tracker-search-row-title">{app.name}</div>
                        <div className="tracker-search-row-dev">{app.artistName}</div>
                        <div className="tracker-search-row-tags">
                          {chips.map((c) => (
                            <span key={c} className="tracker-search-chip">
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="tracker-search-meta">
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

                      <div className="tracker-search-stat-col">
                        <div className="tracker-search-stat-num">{app.dlEst}</div>
                        <div className="tracker-search-stat-sub">/ mois · US</div>
                      </div>

                      <span className="tracker-search-chevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="tracker-search-panel-footer">
                <Link href="/tracker/search?country=us" onClick={() => setOpen(false)}>
                  Recherche avancée →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
