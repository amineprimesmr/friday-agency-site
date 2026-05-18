"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect } from "react";

import { TrackappSidebarFooter } from "@/components/trackapp/trackapp-sidebar-footer";
import { cn } from "@/lib/utils";

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconTracker = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9M13 17V5M8 17v-3" />
  </svg>
);

const IconSearchApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <path d="m16.5 16.5 4 4" />
    <circle cx="15.5" cy="15.5" r="2.5" />
  </svg>
);

const IconRessources = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 7h6M8 11h8" />
    <circle cx="14" cy="15" r="2" />
    <path d="m16 17 2 2" />
  </svg>
);

const IconSoftware = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 22h8" />
    <path d="M12 18v4" />
    <path d="M8 9h.01M12 9h.01M16 9h.01" />
  </svg>
);

const IconRocket = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.3-2 3.2-2 5 1.8 0 3.7-.5 5-2" />
    <path d="M9 15 5 11l6.5-6.5C13.7 2.3 16.7 2 21 3c1 4.3.7 7.3-1.5 9.5L13 19l-4-4Z" />
    <path d="M14 6h4v4" />
    <path d="M13.5 10.5a2 2 0 1 0 0 .01" />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LINKS = [
  { href: "/trackapp/accueil", label: "Accueil", section: "accueil", Icon: IconHome },
  { href: "/trackapp/apptracker", label: "Apptracker", section: "apptracker", Icon: IconSearchApp },
  { href: "/trackapp/creer-mon-app", label: "Créer mon app", section: "creer-mon-app", Icon: IconRocket },
  { href: "/trackapp/espace", label: "Playbook", section: "espace", Icon: IconDashboard },
  { href: "/trackapp/logiciels", label: "Logiciels", section: "logiciels", Icon: IconSoftware },
  { href: "/trackapp/ressources", label: "Ressources", section: "ressources", Icon: IconRessources },
  { href: "/trackapp/favoris", label: "Mes favoris", section: "favoris", Icon: IconHeart },
  { href: "/tracker", label: "Tracker", section: "tracker", Icon: IconTracker },
] as const;

function activeForPath(pathname: string, section: string, href: string): boolean {
  if (section === "tracker") return pathname === "/tracker" || pathname.startsWith("/tracker/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TrackappFidelitySidebar({
  pathname,
  mobileMenuOpen,
  onNavigate,
  email,
  signOutHref,
}: Readonly<{
  pathname: string;
  mobileMenuOpen: boolean;
  onNavigate?: () => void;
  email?: string;
  signOutHref?: string;
}>) {
  const syncExpanded = useCallback(() => {
    const app = document.getElementById("app-app");
    if (app) app.dataset.sidebarExpanded = "true";
  }, []);

  useLayoutEffect(() => {
    syncExpanded();
  }, [syncExpanded]);

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "app-sidebar hidden md:flex flex-col fixed left-0 z-[90]",
        "border-r border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-bg)]",
        mobileMenuOpen && "is-mobile-open",
      )}
      aria-label="Navigation Trackapp"
    >
      <span id="app-business-name" className="app-business-name-hidden" aria-hidden="true">
        Trackapp
      </span>

      <div className="app-sidebar-brand">
        <Link href="/trackapp/accueil" className="app-sidebar-logo" aria-label="Trackapp — Accueil" onClick={() => onNavigate?.()}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[11px] font-extrabold text-white">
            TA
          </span>
          <span className="app-sidebar-logo-text">Trackapp</span>
        </Link>
      </div>

      <nav className="app-sidebar-nav flex-1 overflow-y-auto px-2 py-3 pb-5" aria-label="Navigation principale">
        {LINKS.map((link) => {
          const Icon = link.Icon;
          const active = activeForPath(pathname, link.section, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              data-section={link.section}
              onClick={() => onNavigate?.()}
              className={cn(
                "app-sidebar-link flex items-center gap-2 rounded-[var(--app-radius-sm)] px-2 py-2",
                "text-[var(--app-sidebar-text-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-text)]",
                "transition-colors duration-200",
                active && "app-sidebar-link-active bg-[var(--app-sidebar-active)] font-semibold text-[var(--app-sidebar-text)]",
              )}
            >
              <span className="app-sidebar-icon flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-[1.1rem] [&>svg]:w-[1.1rem]">
                <Icon />
              </span>
              <span className="app-sidebar-link-text truncate whitespace-nowrap">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <TrackappSidebarFooter
        email={email}
        signOutHref={signOutHref ?? "/trackapp/deconnexion"}
        onNavigate={onNavigate}
      />
    </aside>
  );
}
