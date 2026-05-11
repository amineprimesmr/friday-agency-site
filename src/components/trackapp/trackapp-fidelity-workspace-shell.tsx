"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { TrackappBodyClass } from "@/components/trackapp/trackapp-body-class";
import { TrackappFidelitySidebar } from "@/components/trackapp/trackapp-fidelity-sidebar";
import { TrackappFidelityTopbar } from "@/components/trackapp/trackapp-fidelity-topbar";
import { TrackappTopbarSearchModal } from "@/components/trackapp/trackapp-topbar-search-modal";

const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function TrackappFidelityWorkspaceShell({
  children,
  loggedIn,
  email,
  signOutHref,
  planUnlocked,
  stripeReady,
}: Readonly<{
  children: React.ReactNode;
  loggedIn: boolean;
  email?: string | undefined;
  signOutHref: string;
  planUnlocked: boolean;
  stripeReady: boolean;
}>) {
  const pathname = usePathname() ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const trialEndMsRef = useRef<number | null>(null);
  const [trialMsLeft, setTrialMsLeft] = useState(TRIAL_DURATION_MS);

  const onEspace = pathname === "/trackapp/espace" || pathname.startsWith("/trackapp/espace/");
  const onOnboarding = pathname === "/trackapp/onboarding" || pathname.startsWith("/trackapp/onboarding/");

  const welcomeActive = onOnboarding || (onEspace && !planUnlocked);
  const trialChrome = !planUnlocked && (onEspace || onOnboarding);
  const showCluster = onOnboarding || (onEspace && !planUnlocked);
  const clusterMode = onOnboarding ? ("onboarding-info" as const) : ("trial-paywall" as const);
  const showTopbarTrial = onEspace && !planUnlocked;
  const showTrialCard = onEspace && !planUnlocked;

  useLayoutEffect(() => {
    const el = document.getElementById("app-app");
    if (!el) return;
    el.classList.toggle("app-saas-welcome-active", welcomeActive);
    el.classList.toggle("app-saas-trial-chrome-active", trialChrome);
  }, [welcomeActive, trialChrome]);

  useEffect(() => {
    if (trialEndMsRef.current === null) {
      trialEndMsRef.current = Date.now() + TRIAL_DURATION_MS;
    }
    const end = trialEndMsRef.current;
    const tick = () => setTrialMsLeft(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobile = useCallback(() => setMobileMenuOpen((v) => !v), []);

  const onSubscribe = useCallback(async () => {
    if (!stripeReady) {
      alert("Stripe doit être configuré (STRIPE_SECRET_KEY + STRIPE_PRICE_ID_TRACKAPP ou _MONTHLY).");
      return;
    }
    const res = await fetch("/api/trackapp/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
      alert((err as { error?: string }).error ?? "Paiement indisponible.");
      return;
    }
    const data = (await res.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  }, [stripeReady]);

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
        <TrackappFidelityTopbar
          email={email}
          loggedIn={loggedIn}
          signOutHref={signOutHref}
          onMenuClick={toggleMobile}
          mobileMenuOpen={mobileMenuOpen}
          saasClusterShow={showCluster}
          saasClusterMode={clusterMode}
          trialMsLeft={trialMsLeft}
          showTopbarTrial={showTopbarTrial}
          stripeReady={stripeReady}
          onSubscribe={onSubscribe}
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
          showTrialCard={showTrialCard}
          trialMsLeft={trialMsLeft}
          stripeReady={stripeReady}
          onSubscribeCheckout={onSubscribe}
        />

        <main className="app-main">
          <div className="app-content">{children}</div>
        </main>
      </div>
    </>
  );
}
