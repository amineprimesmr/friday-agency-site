"use client";

import { TrackappLogoMark } from "@/components/trackapp/trackapp-logo-mark";
import type { ComponentType } from "react";
import { useCallback, useLayoutEffect } from "react";
import Link from "next/link";

import { TrackappSidebarFavoritesGroup } from "@/components/trackapp/trackapp-sidebar-favorites-group";
import { TrackappSidebarFooter } from "@/components/trackapp/trackapp-sidebar-footer";
import { cn } from "@/lib/utils";

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
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

const IconAds = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11h3l8-5v12l-8-5H3z" />
    <path d="M6 13v5a2 2 0 0 0 2 2h1" />
    <path d="M18 9a4 4 0 0 1 0 6" />
    <path d="M21 7a7 7 0 0 1 0 10" />
  </svg>
);

const IconOrganic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20c0-6 4-10 10-10h4v4c0 6-4 10-10 10H7z" />
    <path d="M7 20c0-8-4-11-4-15 5 0 8 3 8 8" />
    <path d="M9 18c2-4 5-6 9-6" />
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

type SidebarLink = {
  href: string;
  label: string;
  section: string;
  Icon: ComponentType;
  soon?: boolean;
};

const LINKS: readonly SidebarLink[] = [
  { href: "/trackapp/accueil", label: "Accueil", section: "accueil", Icon: IconHome },
  { href: "/trackapp/apptracker", label: "Apps du mois", section: "apptracker", Icon: IconSearchApp },
  { href: "/trackapp/creer-mon-app", label: "Créer mon app", section: "creer-mon-app", Icon: IconRocket },
  { href: "/trackapp/ads", label: "Ads", section: "ads", Icon: IconAds },
  { href: "/trackapp/organique", label: "Organique", section: "organique", Icon: IconOrganic, soon: true },
  { href: "/trackapp/logiciels", label: "Logiciels", section: "logiciels", Icon: IconSoftware },
  { href: "/trackapp/ressources", label: "Ressources", section: "ressources", Icon: IconRessources },
];

function activeForPath(pathname: string, section: string, href: string): boolean {
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
          <TrackappLogoMark size="sm" className="app-sidebar-logo-img app-sidebar-logo-img--brand" decorative />
          <span className="app-sidebar-logo-text">Trackapp</span>
        </Link>
      </div>

      <nav className="app-sidebar-nav flex-1 overflow-y-auto px-2 pb-5" aria-label="Navigation principale">
        {LINKS.map((link) => {
          const Icon = link.Icon;
          const active = !link.soon && activeForPath(pathname, link.section, link.href);

          const itemClassName = cn(
            "app-sidebar-link flex items-center gap-2 rounded-[var(--app-radius-sm)] px-2 py-2",
            "transition-colors duration-200",
            link.soon
              ? "cursor-default opacity-50 grayscale"
              : [
                  "text-[var(--app-sidebar-text-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-text)]",
                  active &&
                    "app-sidebar-link-active bg-[var(--app-sidebar-active)] font-semibold text-[var(--app-sidebar-text)]",
                ],
          );

          const itemBody = (
            <>
              <span className="app-sidebar-icon flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-[1.1rem] [&>svg]:w-[1.1rem]">
                <Icon />
              </span>
              <span className="app-sidebar-link-text truncate whitespace-nowrap">{link.label}</span>
              {link.soon ? (
                <span className="ml-auto rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.12em] text-slate-500">
                  Soon
                </span>
              ) : null}
            </>
          );

          if (link.soon) {
            return (
              <span
                key={link.href}
                data-section={link.section}
                aria-disabled="true"
                title="Bientôt disponible"
                className={itemClassName}
              >
                {itemBody}
              </span>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              data-section={link.section}
              onClick={() => onNavigate?.()}
              className={itemClassName}
            >
              {itemBody}
            </Link>
          );
        })}

        <TrackappSidebarFavoritesGroup pathname={pathname} onNavigate={onNavigate} />
      </nav>

      <TrackappSidebarFooter
        email={email}
        signOutHref={signOutHref ?? "/trackapp/deconnexion"}
        onNavigate={onNavigate}
      />
    </aside>
  );
}
