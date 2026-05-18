"use client";

import Link from "next/link";

import "@/styles/trackapp-topbar-affiliate-glass.css";
import "@/styles/tracker-search-bar.css";

export function TrackappFidelityTopbar({
  onMenuClick,
  mobileMenuOpen,
  onSearchOpen,
}: Readonly<{
  email?: string | undefined;
  signOutHref: string;
  loggedIn: boolean;
  onMenuClick: () => void;
  mobileMenuOpen: boolean;
  onSearchOpen: () => void;
}>) {
  return (
    <>
      <header className="app-desktop-topbar" id="app-desktop-topbar" aria-label="Navigation principale bureau">
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

        <Link href="/trackapp/accueil" className="app-desktop-topbar__brand" aria-label="Trackapp — Accueil">
          <span className="app-desktop-topbar__brand-mark" aria-hidden="true">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[11px] font-extrabold text-white">
              TA
            </span>
          </span>
          <span className="app-desktop-topbar__brand-text">Trackapp</span>
        </Link>

        <div className="app-desktop-topbar__search-center">
          <div className="app-desktop-topbar__tracker-search-wrap">
            <div className="tracker-switcher-host min-w-0 w-full">
              <button
                type="button"
                className="tracker-search-pill tracker-search-pill--trigger"
                id="app-topbar-search-open"
                aria-haspopup="dialog"
                aria-controls="app-topbar-search-dialog"
                onClick={onSearchOpen}
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
                <span className="tracker-search-pill-placeholder">Rechercher une app…</span>
                <span className="app-desktop-topbar__kbd" aria-hidden="true">
                  <kbd className="app-desktop-topbar__key" id="app-topbar-kbd-mod">
                    ⌘
                  </kbd>
                  <kbd className="app-desktop-topbar__key">K</kbd>
                </span>
              </button>
            </div>
          </div>

        </div>

        <div className="app-desktop-topbar__actions">
          <div className="trackapp-topbar-affiliate-glass-host trackapp-topbar-affiliate-glass-host--right">
            <Link href="/trackapp/gagner-240" className="trackapp-topbar-affiliate-glass">
              <span className="trackapp-topbar-affiliate-glass__label">
                <span>Affiliation</span>
                <span>−40&nbsp;% pour tes filleuls</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

    </>
  );
}
