"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export function TrackappTopbarSearchModal({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const router = useRouter();
  const id = useId();
  const titleId = `app-topbar-search-title-${id}`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = useCallback(() => {
    const term = q.trim();
    onClose();
    setQ("");
    if (term.length > 0) {
      router.push(`/trackapp/apptracker?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/trackapp/apptracker");
    }
  }, [q, onClose, router]);

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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            aria-autocomplete="list"
          />
          <button type="button" className="app-topbar-search-filter" aria-label="Filtres" title="Bientôt" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>
        </div>
        <div className="app-topbar-search-chips" id="app-topbar-search-chips" role="tablist" aria-label="Raccourcis" />
        <div className="app-topbar-search-body">
          <ul className="app-topbar-search-results hidden" id="app-topbar-search-results" role="listbox" />
          <div className="app-topbar-search-empty" id="app-topbar-search-empty">
            <div className="app-topbar-search-empty-ico" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <p className="app-topbar-search-empty-text" id="app-topbar-search-empty-text">
              Entre un nom d&apos;app puis Entrée — les résultats s&apos;ouvriront dans Apptracker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
