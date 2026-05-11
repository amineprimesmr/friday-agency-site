"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { TrackappBodyClass } from "@/components/trackapp/trackapp-body-class";
import { TrackappFidelitySidebar } from "@/components/trackapp/trackapp-fidelity-sidebar";
import { TrackappFidelityTopbar } from "@/components/trackapp/trackapp-fidelity-topbar";

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

  return (
    <>
      <TrackappBodyClass active />
      <div
        id="app-app"
        className="app-unified-shell app-saas-welcome-active"
        data-mobile-section="dashboard"
        data-sidebar-expanded="false"
      >
        <TrackappFidelityTopbar
          email={email}
          loggedIn={loggedIn}
          signOutHref={signOutHref}
          onMenuClick={toggleMobile}
          mobileMenuOpen={mobileMenuOpen}
        />
        <div
          className={mobileMenuOpen ? "app-sidebar-overlay is-open" : "app-sidebar-overlay"}
          aria-hidden="true"
          onClick={closeMobile}
          role="presentation"
        />
        <TrackappFidelitySidebar pathname={pathname} mobileMenuOpen={mobileMenuOpen} onNavigate={closeMobile} />
        <main className="app-main">{children}</main>
      </div>
    </>
  );
}
