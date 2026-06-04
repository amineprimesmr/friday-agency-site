"use client";

import { Space_Grotesk } from "next/font/google";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { isTrackappCreerUneAppPath } from "@/lib/trackapp-applab-create/paths";
import { isTrackappLiteFullscreenPath } from "@/lib/trackapp-lite-paths";
import { TrackerLiquidGlassFilterSvg } from "@/components/tracker/tracker-liquid-glass-filter-svg";
import { TrackappBodyClass } from "@/components/trackapp/trackapp-body-class";
import { TrackappFidelitySidebar } from "@/components/trackapp/trackapp-fidelity-sidebar";
import { TrackappLandingAuthBar } from "@/components/trackapp/trackapp-landing-auth-bar";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-lab-nav.css";
import "@/styles/trackapp-landing-auth-bar.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

function readStoredSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem("trackapp:sidebar-collapsed") === "1";
  } catch {
    return false;
  }
}

function landingSidebarCollapsed(pathname: string): boolean {
  return isTrackappCreerUneAppPath(pathname);
}

export function TrackappFidelityWorkspaceShell({
  children,
  loggedIn,
  email,
  signOutHref,
}: Readonly<{
  children: React.ReactNode;
  loggedIn: boolean;
  email?: string | undefined;
  signOutHref: string;
}>) {
  const pathname = usePathname() ?? "";
  const isApplabCreatePage = isTrackappCreerUneAppPath(pathname);
  const isLiteFullscreen = isTrackappLiteFullscreenPath(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    if (landingSidebarCollapsed(window.location.pathname)) return true;
    return readStoredSidebarCollapsed();
  });

  useLayoutEffect(() => {
    if (landingSidebarCollapsed(pathname)) {
      setSidebarCollapsed(true);
      return;
    }
    setSidebarCollapsed(readStoredSidebarCollapsed());
  }, [pathname]);

  useLayoutEffect(() => {
    const el = document.getElementById("app-app");
    if (!el) return;
    el.classList.remove(
      "app-saas-welcome-active",
      "app-saas-trial-chrome-active",
      "app-settings-sheet-open",
      "app-settings-sheet-closing",
    );
    document.querySelectorAll<HTMLElement>(".app-settings-backdrop.is-open").forEach((node) => {
      node.classList.remove("is-open");
    });
  }, []);

  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.classList.add("app-mobile-menu-open");
    else document.body.classList.remove("app-mobile-menu-open");
    return () => document.body.classList.remove("app-mobile-menu-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("trackapp:sidebar-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  return (
    <>
      <TrackappBodyClass active />
      <div
        id="app-app"
        className={cn("app-unified-shell", spaceGrotesk.variable)}
        data-mobile-section="dashboard"
        data-sidebar-expanded={sidebarCollapsed ? "false" : "true"}
        data-route-kind={
          isApplabCreatePage ? "applab-create" : isLiteFullscreen ? "lite-fullscreen" : "workspace"
        }
      >
        <TrackerLiquidGlassFilterSvg />

        <button
          type="button"
          className={mobileMenuOpen ? "app-sidebar-overlay is-open" : "app-sidebar-overlay"}
          id="app-sidebar-overlay"
          aria-label="Fermer le menu"
          aria-hidden={!mobileMenuOpen}
          onClick={closeMobile}
        />

        <TrackappFidelitySidebar
          pathname={pathname}
          mobileMenuOpen={mobileMenuOpen}
          onNavigate={closeMobile}
          email={email}
          signOutHref={signOutHref}
          loggedIn={loggedIn}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />

        {!isApplabCreatePage && !isLiteFullscreen ? (
          <button
            type="button"
            className="trackapp-mobile-menu-btn md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="app-sidebar"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span aria-hidden />
            <span aria-hidden />
            <span aria-hidden />
          </button>
        ) : null}

        {isApplabCreatePage ? <TrackappLandingAuthBar loggedIn={loggedIn} /> : null}

        <main className="app-main">
          <div className="app-content">{children}</div>
        </main>
      </div>
    </>
  );
}
