"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";

import { formatTrialMsLeft } from "@/components/trackapp/trackapp-trial-countdown";
import { cn } from "@/lib/utils";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconOnboarding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const IconTracker = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9M13 17V5M8 17v-3" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LINKS = [
  { href: "/trackapp/espace", label: "Playbook", section: "espace", Icon: IconDashboard },
  { href: "/trackapp/onboarding", label: "Onboarding", section: "onboarding", Icon: IconOnboarding },
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
  showTrialCard,
  trialMsLeft,
  stripeReady,
  onSubscribeCheckout,
}: Readonly<{
  pathname: string;
  mobileMenuOpen: boolean;
  onNavigate?: () => void;
  showTrialCard: boolean;
  trialMsLeft: number;
  stripeReady: boolean;
  onSubscribeCheckout: () => void;
}>) {
  const [isHovered, setIsHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const expanded = open || isHovered;

  const syncDataset = useCallback((ex: boolean) => {
    const app = document.getElementById("app-app");
    if (app) app.dataset.sidebarExpanded = ex ? "true" : "false";
  }, []);

  const { compact } = formatTrialMsLeft(trialMsLeft);

  return (
    <motion.aside
      id="app-sidebar"
      className={cn(
        "app-sidebar hidden md:flex flex-col fixed left-0 z-[90]",
        "border-r border-[var(--app-sidebar-border)] bg-[var(--app-sidebar-bg)]",
        mobileMenuOpen && "is-mobile-open",
      )}
      initial={false}
      animate={{ width: expanded ? 272 : 72 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => {
        setIsHovered(true);
        setOpen(true);
        syncDataset(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setOpen(false);
        syncDataset(false);
      }}
      style={{ minWidth: expanded ? 272 : 72 }}
      aria-label="Navigation Trackapp"
    >
      <span id="app-business-name" className="app-business-name-hidden" aria-hidden="true">
        Trackapp
      </span>

      <div className="app-sidebar-brand">
        <Link href="/trackapp/espace" className="app-sidebar-logo" aria-label="Trackapp" onClick={() => onNavigate?.()}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[12px] font-extrabold text-white">
            TA
          </span>
          <span className="app-sidebar-logo-text">Trackapp</span>
        </Link>
      </div>

      <nav className="app-sidebar-nav flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation principale">
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
                "app-sidebar-link flex items-center gap-3 rounded-[var(--app-radius-sm)] px-3 py-2.5",
                "text-[var(--app-sidebar-text-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-text)]",
                "transition-colors duration-200",
                active && "app-sidebar-link-active bg-[var(--app-sidebar-active)] font-semibold text-[var(--app-sidebar-text)]",
              )}
            >
              <span className="app-sidebar-icon flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-[1.2rem] [&>svg]:w-[1.2rem]">
                <Icon />
              </span>
              <span className="app-sidebar-link-text truncate whitespace-nowrap">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="app-sidebar-footer border-t border-[var(--app-sidebar-border)] px-5 py-4">
        <span id="app-user-email" className="visually-hidden" aria-hidden="true" />
        <Link
          href="/trackapp"
          data-section="accueil"
          onClick={() => onNavigate?.()}
          className={cn(
            "app-sidebar-link app-sidebar-footer-settings flex items-center gap-3 rounded-[var(--app-radius-sm)] px-3 py-2.5",
            "text-[var(--app-sidebar-text-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-text)]",
            pathname === "/trackapp" && "app-sidebar-link-active bg-[var(--app-sidebar-active)] font-semibold text-[var(--app-sidebar-text)]",
          )}
        >
          <span className="app-sidebar-icon" aria-hidden="true">
            <IconUser />
          </span>
          <span className="app-sidebar-link-text">Accueil Trackapp</span>
        </Link>

        <div
          id="app-sidebar-trial-subscribe-card"
          className={showTrialCard ? "app-sidebar-trial-subscribe-card" : "app-sidebar-trial-subscribe-card hidden"}
          aria-hidden={!showTrialCard}
        >
          <p id="app-sidebar-trial-subscribe-remaining" className="app-sidebar-trial-subscribe-card__remaining">
            Accès complet · {compact}
          </p>
          <p className="app-sidebar-trial-subscribe-card__title">Débloquer tout le playbook</p>
          <button
            type="button"
            id="app-sidebar-trial-subscribe-btn"
            className="app-sidebar-trial-subscribe-card__button"
            disabled={!stripeReady}
            onClick={onSubscribeCheckout}
          >
            Paiement sécurisé
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
