"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTrackappBreadcrumbOverride } from "@/components/trackapp/trackapp-breadcrumb-context";
import { resolveTrackappBreadcrumb } from "@/lib/trackapp-workspace-nav";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-topbar-affiliate-glass.css";

export function TrackappLabTopbar({
  onMenuClick,
  mobileMenuOpen,
}: Readonly<{
  onMenuClick: () => void;
  mobileMenuOpen: boolean;
}>) {
  const pathname = usePathname() ?? "";
  const override = useTrackappBreadcrumbOverride();
  const crumb = resolveTrackappBreadcrumb(pathname);
  const pageLabel = override?.pageLabel ?? crumb.pageLabel;

  return (
    <header className="app-desktop-topbar trackapp-lab-topbar" id="app-desktop-topbar" aria-label="Navigation principale">
      <button
        type="button"
        className="trackapp-lab-topbar__panel-btn app-desktop-topbar__menu-btn"
        id="app-topbar-menu-toggle"
        aria-label="Ouvrir le menu"
        aria-controls="app-sidebar"
        aria-expanded={mobileMenuOpen}
        onClick={onMenuClick}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-[18px] w-[18px]">
          <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 3.5v13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <nav className="trackapp-lab-topbar__crumbs" aria-label="Fil d'Ariane">
        <span className="trackapp-lab-topbar__crumb trackapp-lab-topbar__crumb--section">{crumb.sectionLabel}</span>
        {crumb.hubLabel && crumb.hubHref ? (
          <>
            <span className="trackapp-lab-topbar__crumb-sep" aria-hidden>
              ›
            </span>
            <Link
              href={crumb.hubHref}
              className={cn("trackapp-lab-topbar__crumb", "trackapp-lab-topbar__crumb--hub")}
            >
              {crumb.hubLabel}
            </Link>
          </>
        ) : null}
        <span className="trackapp-lab-topbar__crumb-sep" aria-hidden>
          ›
        </span>
        <span className="trackapp-lab-topbar__crumb trackapp-lab-topbar__crumb--current truncate">{pageLabel}</span>
      </nav>

      <div className="app-desktop-topbar__actions trackapp-lab-topbar__actions">
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
  );
}
