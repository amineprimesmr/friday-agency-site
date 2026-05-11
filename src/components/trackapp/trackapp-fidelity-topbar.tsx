"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { TrackappSaasWelcomeCluster } from "@/components/trackapp/trackapp-saas-welcome-cluster";
import { formatTrialMsLeft, TrialCountdownTopbar } from "@/components/trackapp/trackapp-trial-countdown";

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
  saasClusterShow,
  saasClusterMode,
  trialMsLeft,
  showTopbarTrial,
  stripeReady,
  onSubscribe,
  onSearchOpen,
}: Readonly<{
  email?: string | undefined;
  signOutHref: string;
  loggedIn: boolean;
  onMenuClick: () => void;
  mobileMenuOpen: boolean;
  saasClusterShow: boolean;
  saasClusterMode: "trial-paywall" | "onboarding-info";
  trialMsLeft: number;
  showTopbarTrial: boolean;
  stripeReady: boolean;
  onSubscribe: () => void;
  onSearchOpen: () => void;
}>) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const storeRef = useRef<HTMLDivElement | null>(null);

  const topbarCompact = formatTrialMsLeft(trialMsLeft).compact;

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
          <span
            id="app-topbar-trial-countdown"
            className={showTopbarTrial ? "app-desktop-topbar__trial-countdown" : "app-desktop-topbar__trial-countdown hidden"}
            aria-label={topbarCompact}
          >
            {showTopbarTrial ? <TrialCountdownTopbar msLeft={trialMsLeft} /> : "—"}
          </span>
          <button
            type="button"
            className="app-desktop-topbar__search-trigger"
            id="app-topbar-search-open"
            aria-haspopup="dialog"
            aria-controls="app-topbar-search-dialog"
            onClick={onSearchOpen}
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
          </button>
          <span
            id="app-topbar-trial-cta-wrap"
            className={showTopbarTrial ? "app-desktop-topbar__trial-cta-wrap" : "app-desktop-topbar__trial-cta-wrap hidden"}
          >
            <button
              type="button"
              id="app-topbar-trial-cta"
              className="app-desktop-topbar__trial-cta"
              disabled={!stripeReady}
              onClick={onSubscribe}
            >
              Débloquer le playbook
            </button>
            <span className="app-desktop-topbar__trial-badge">PRO</span>
          </span>
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
              id="app-topbar-store-btn"
              aria-expanded={storeOpen}
              aria-haspopup="true"
              aria-controls="app-topbar-store-panel"
              onClick={(e) => {
                e.stopPropagation();
                setAlertsOpen(false);
                setStoreOpen((v) => !v);
              }}
            >
              <span className="app-desktop-topbar__store-badge" id="app-topbar-store-initials" aria-hidden="true">
                TA
              </span>
              <span className="app-desktop-topbar__store-name" id="app-topbar-store-name">
                Trackapp
              </span>
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
                <span className="app-desktop-topbar__store-badge app-desktop-topbar__store-badge--sm" id="app-topbar-menu-store-initials" aria-hidden="true">
                  TA
                </span>
                <span className="app-desktop-topbar__store-row-text" id="app-topbar-menu-store-name">
                  Workspace Trackapp
                </span>
                <svg className="app-desktop-topbar__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <hr className="app-desktop-topbar__hr" />
              <div className="app-desktop-topbar__user-block">
                <span className="app-desktop-topbar__user-avatar" id="app-topbar-user-avatar">
                  {userInitial(email)}
                </span>
                <div className="app-desktop-topbar__user-meta">
                  <span className="app-desktop-topbar__user-name" id="app-topbar-user-name">
                    {userShortName(email)}
                  </span>
                  <span className="app-desktop-topbar__user-email" id="app-topbar-user-email-display">
                    {email ?? ""}
                  </span>
                </div>
              </div>
              <hr className="app-desktop-topbar__hr" />
              {loggedIn ?
                <Link href={signOutHref} className="app-desktop-topbar__logout" id="app-topbar-logout-btn" onClick={() => setStoreOpen(false)}>
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

      <TrackappSaasWelcomeCluster
        show={saasClusterShow}
        mode={saasClusterMode}
        trialMsLeft={trialMsLeft}
        stripeReady={stripeReady}
        onSubscribe={onSubscribe}
      />
    </header>
  );
}
