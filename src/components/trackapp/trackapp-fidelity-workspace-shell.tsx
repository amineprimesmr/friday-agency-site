"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { TrackerLiquidGlassFilterSvg } from "@/components/tracker/tracker-liquid-glass-filter-svg";
import { TrackappBodyClass } from "@/components/trackapp/trackapp-body-class";
import { TrackappFidelitySidebar } from "@/components/trackapp/trackapp-fidelity-sidebar";
import { TrackappFidelityTopbar } from "@/components/trackapp/trackapp-fidelity-topbar";
import { TrackappTopbarSearchModal } from "@/components/trackapp/trackapp-topbar-search-modal";

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
  const [searchOpen, setSearchOpen] = useState(false);

  useLayoutEffect(() => {
    const el = document.getElementById("app-app");
    if (!el) return;
    el.classList.remove("app-saas-welcome-active", "app-saas-trial-chrome-active");
  }, []);

  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobile = useCallback(() => setMobileMenuOpen((v) => !v), []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.classList.add("app-mobile-menu-open");
    else document.body.classList.remove("app-mobile-menu-open");
    return () => document.body.classList.remove("app-mobile-menu-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement
        || el instanceof HTMLTextAreaElement
        || el instanceof HTMLSelectElement
        || (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <TrackappBodyClass active />
      <div id="app-app" className="app-unified-shell" data-mobile-section="dashboard" data-sidebar-expanded="false">
        <TrackerLiquidGlassFilterSvg />
        <TrackappFidelityTopbar
          email={email}
          loggedIn={loggedIn}
          signOutHref={signOutHref}
          onMenuClick={toggleMobile}
          mobileMenuOpen={mobileMenuOpen}
          onSearchOpen={() => setSearchOpen(true)}
        />

        <button
          type="button"
          className={mobileMenuOpen ? "app-sidebar-overlay is-open" : "app-sidebar-overlay"}
          id="app-sidebar-overlay"
          aria-label="Fermer le menu"
          aria-hidden={!mobileMenuOpen}
          onClick={closeMobile}
        />

        <TrackappTopbarSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

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
    </>
  );
}
