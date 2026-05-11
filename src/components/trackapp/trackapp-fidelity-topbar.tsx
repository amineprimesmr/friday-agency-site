"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function userInitial(email: string | undefined): string {
  if (!email || !email.trim()) return "?";
  const c = email.trim()[0];
  return c.toUpperCase();
}

function userShortName(email: string | undefined): string {
  if (!email) return "Compte";
  return email.includes("@") ? email.split("@")[0] ?? "Compte" : email;
}

export function TrackappFidelityTopbar({
  email,
  signOutHref,
  loggedIn,
  onMenuClick,
  mobileMenuOpen,
}: Readonly<{
  email?: string | undefined;
  signOutHref: string;
  loggedIn: boolean;
  onMenuClick: () => void;
  mobileMenuOpen: boolean;
}>) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const storeRef = useRef<HTMLDivElement | null>(null);

  const closeAll = useCallback(() => {
    setAlertsOpen(false);
    setStoreOpen(false);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (alertsRef.current?.contains(t) || storeRef.current?.contains(t)) return;
      closeAll();
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [closeAll]);

  return (
    <header className="app-desktop-topbar" id="app-desktop-topbar" aria-label="Navigation principale bureau">
      <div className="app-desktop-topbar__inner">
        <button
          type="button"
          className="app-desktop-topbar__menu-btn"
          id="app-topbar-menu-toggle"
          aria-label="Ouvrir le menu"
          aria-controls="app-sidebar"
          aria-expanded={mobileMenuOpen}
          onClick={onMenuClick}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/trackapp" className="app-desktop-topbar__brand" aria-label="Trackapp — Accueil">
          <span className="app-desktop-topbar__brand-mark" aria-hidden="true">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[11px] font-extrabold text-white">
              TA
            </span>
          </span>
          <span className="app-desktop-topbar__brand-text">Trackapp</span>
        </Link>

        <div className="app-desktop-topbar__search-center">
          <span className="app-desktop-topbar__trial-countdown hidden" aria-hidden="true">
            —
          </span>
          <Link
            href="/tracker/search"
            className="app-desktop-topbar__search-trigger"
            id="app-topbar-search-open"
            aria-label="Rechercher une app sur le Tracker"
          >
            <span className="app-desktop-topbar__search-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <span className="app-desktop-topbar__search-placeholder">Rechercher une app…</span>
            <span className="app-desktop-topbar__kbd" aria-hidden="true">
              <kbd className="app-desktop-topbar__key" id="app-topbar-kbd-mod">
                ⌘
              </kbd>
              <kbd className="app-desktop-topbar__key">K</kbd>
            </span>
          </Link>
        </div>

        <div className="app-desktop-topbar__actions">
          <div className="app-desktop-topbar__dropdown-wrap" ref={alertsRef}>
            <button
              type="button"
              className="app-desktop-topbar__icon-btn"
              aria-expanded={alertsOpen}
              aria-haspopup="true"
              title="Alertes"
              onClick={(e) => {
                e.stopPropagation();
                setStoreOpen(false);
                setAlertsOpen((v) => !v);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className="app-desktop-topbar__panel app-desktop-topbar__panel--alerts"
              id="app-topbar-alerts-panel"
              role="menu"
              hidden={!alertsOpen}
            >
              <div className="app-desktop-topbar__panel-head">
                <span>Alertes</span>
              </div>
              <div className="app-desktop-topbar__panel-empty">
                <p>Rien pour l’instant — les alertes liées à ton playbook apparaîtront ici.</p>
              </div>
            </div>
          </div>

          <div className="app-desktop-topbar__dropdown-wrap" ref={storeRef}>
            <button
              type="button"
              className="app-desktop-topbar__store-trigger"
              aria-expanded={storeOpen}
              aria-haspopup="true"
              aria-controls="app-topbar-store-panel"
              onClick={(e) => {
                e.stopPropagation();
                setAlertsOpen(false);
                setStoreOpen((v) => !v);
              }}
            >
              <span className="app-desktop-topbar__store-badge" aria-hidden="true">
                TA
              </span>
              <span className="app-desktop-topbar__store-name">Trackapp</span>
              <span className="app-desktop-topbar__store-chevron" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className="app-desktop-topbar__panel app-desktop-topbar__panel--store"
              id="app-topbar-store-panel"
              role="menu"
              hidden={!storeOpen}
            >
              <div className="app-desktop-topbar__store-row app-desktop-topbar__store-row--active">
                <span className="app-desktop-topbar__store-badge app-desktop-topbar__store-badge--sm" aria-hidden="true">
                  TA
                </span>
                <span className="app-desktop-topbar__store-row-text">Workspace Trackapp</span>
                <svg className="app-desktop-topbar__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <hr className="app-desktop-topbar__hr" />
              <div className="app-desktop-topbar__user-block">
                <span className="app-desktop-topbar__user-avatar">{userInitial(email)}</span>
                <div className="app-desktop-topbar__user-meta">
                  <span className="app-desktop-topbar__user-name">{userShortName(email)}</span>
                  <span className="app-desktop-topbar__user-email" id="app-topbar-user-email-display">
                    {email ?? ""}
                  </span>
                </div>
              </div>
              <hr className="app-desktop-topbar__hr" />
              {loggedIn ?
                <Link href={signOutHref} className="app-desktop-topbar__logout" onClick={() => setStoreOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Se déconnecter
                </Link>
              : (
                <Link href="/trackapp/connexion" className="app-desktop-topbar__store-add" onClick={() => setStoreOpen(false)}>
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
