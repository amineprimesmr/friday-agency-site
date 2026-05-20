"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { TrackerLiquidGlassFilterSvg } from "@/components/tracker/tracker-liquid-glass-filter-svg";
import { TrackappBodyClass } from "@/components/trackapp/trackapp-body-class";
import { TrackappBreadcrumbProvider } from "@/components/trackapp/trackapp-breadcrumb-context";
import { TrackappFidelitySidebar } from "@/components/trackapp/trackapp-fidelity-sidebar";
import { TrackappFidelityTopbar } from "@/components/trackapp/trackapp-fidelity-topbar";

import "@/styles/trackapp-lab-nav.css";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const el = document.getElementById("app-app");
    if (!el) return;
    el.classList.remove("app-saas-welcome-active", "app-saas-trial-chrome-active");
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

  return (
    <TrackappBreadcrumbProvider>
      <TrackappBodyClass active />
      <div id="app-app" className="app-unified-shell" data-mobile-section="dashboard" data-sidebar-expanded="false">
        <TrackerLiquidGlassFilterSvg />
        <TrackappFidelityTopbar />

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
        />

        <main className="app-main">
          <div className="app-content">{children}</div>
        </main>
      </div>
    </TrackappBreadcrumbProvider>
  );
}
