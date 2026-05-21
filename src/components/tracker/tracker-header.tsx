"use client";

import { TrackappLogoMark } from "@/components/trackapp/trackapp-logo-mark";
import type { TrackerSearchSurface } from "@/components/tracker/tracker-search-bar";
import { TrackerLiquidGlassFilterSvg } from "@/components/tracker/tracker-liquid-glass-filter-svg";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TRACKER_CONNEXION_HREF,
  TRACKER_WORKSPACE_HREF,
  trackerAuthNavActive,
} from "@/lib/tracker-auth-nav";
import { useTouchDevice } from "@/lib/use-touch-device";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";

import "@/styles/tracker-header.css";

const TrackerSearchBar = dynamic(
  () => import("@/components/tracker/tracker-search-bar").then((mod) => mod.TrackerSearchBar),
  { ssr: false },
);

const TrackappAuthOverlay = dynamic(
  () => import("@/components/trackapp/trackapp-auth-overlay").then((mod) => mod.TrackappAuthOverlay),
  { ssr: false },
);

/** Sections à fond clair derrière lesquelles le menu passe en encre noire */
const LIGHT_SURFACE_SELECTORS = ["#comment-ca-marche", ".tt-affiliate-shell"] as const;

const BASE_NAV = [
  { href: "/tracker", label: "Accueil" },
  { href: "/tracker/top-charts", label: "Classements" },
  { href: "/tracker/affiliation", label: "Affiliation" },
] as const;

function navActive(pathname: string, href: string) {
  if (href.startsWith("/trackapp/")) return trackerAuthNavActive(pathname, href);
  if (href === "/tracker") return pathname === "/tracker";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TrackerHeader({
  loggedIn = false,
  searchSurface,
}: {
  loggedIn?: boolean;
  searchSurface?: TrackerSearchSurface;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const touch = useTouchDevice();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    for (const item of BASE_NAV) {
      void router.prefetch(item.href);
    }
    if (loggedIn) void router.prefetch(TRACKER_WORKSPACE_HREF);
  }, [router, loggedIn]);
  const mobileId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [onLightSurface, setOnLightSurface] = useState(false);
  const lightSurfaceRefs = useRef<Element[]>([]);

  useEffect(() => {
    lightSurfaceRefs.current = LIGHT_SURFACE_SELECTORS.flatMap((sel) => Array.from(document.querySelectorAll(sel)));
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!touch) {
        const y = window.scrollY || document.documentElement.scrollTop;
        const nextProgress = Math.min(1, y / 120);
        setScrollProgress((prev) => (Math.abs(prev - nextProgress) > 0.02 ? nextProgress : prev));
      }

      const header = document.querySelector<HTMLElement>(".tracker-header-bar");
      if (!header) return;
      const hr = header.getBoundingClientRect();
      const midY = hr.top + hr.height * 0.38;
      const midX = Math.min(Math.max(window.innerWidth * 0.5, 8), window.innerWidth - 8);
      const hit = lightSurfaceRefs.current.some((el) => {
        const r = el.getBoundingClientRect();
        return r.height >= 4 && midY >= r.top && midY <= r.bottom && midX >= r.left && midX <= r.right;
      });
      setOnLightSurface((prev) => (prev === hit ? prev : hit));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    const t = window.setTimeout(schedule, 80);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [pathname, mobileOpen, searchOpen, touch]);

  const k = reduceMotion || touch ? 1 : 1 + scrollProgress * 0.45;
  const blurA = reduceMotion ? 14 : touch ? 16 : 18 * k;
  const blurB = reduceMotion ? 8 : touch ? 0 : 9 * k;
  const blurC = reduceMotion ? 4 : touch ? 0 : 5 * k;

  const blurTransition =
    reduceMotion || touch
      ? undefined
      : ("backdrop-filter 0.2s cubic-bezier(0.22, 1, 0.36, 1), -webkit-backdrop-filter 0.2s cubic-bezier(0.22, 1, 0.36, 1)" as const);

  const layerStyle = (px: number): CSSProperties => ({
    WebkitBackdropFilter: `blur(${px.toFixed(1)}px)`,
    backdropFilter: `blur(${px.toFixed(1)}px)`,
    ...(blurTransition ? { transition: blurTransition } : {}),
  });

  const toggleSearch = () => {
    setSearchOpen((o) => {
      const next = !o;
      if (next) setMobileOpen(false);
      return next;
    });
  };

  const openMobile = () => {
    setMobileOpen(true);
    setSearchOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const openAuthModal = () => {
    setAuthOpen(true);
    closeMobile();
  };

  const mobilePanelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.46, ease: [0.16, 1, 0.3, 1] as const };

  const mobileBackdropTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <TrackerLiquidGlassFilterSvg />
      <header className="tracker-header-bar fixed inset-x-0 top-0 z-[920] bg-transparent">
        <div className="tracker-header-backdrop-layers" aria-hidden>
          <div className="tracker-header-blur-a" style={layerStyle(blurA)} />
          <div className="tracker-header-blur-b" style={layerStyle(blurB)} />
          <div className="tracker-header-blur-c" style={layerStyle(blurC)} />
        </div>
        <div
          className={cn(
            "tracker-header-top relative z-[2] mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 pb-2.5 pt-[max(0.95rem,env(safe-area-inset-top,0px))] sm:px-6 lg:gap-4 lg:px-6 xl:px-10 2xl:px-14",
            onLightSurface && "tracker-header-top--light",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 lg:flex-none lg:flex-initial lg:gap-6",
              searchOpen && "max-lg:hidden",
            )}
          >
            <Link
              href="/tracker"
              className={cn(
                "tracker-header-brand tracker-header-mobile-brand-left shrink-0",
                searchOpen && "max-lg:hidden",
              )}
              onClick={closeMobile}
            >
              <TrackappLogoMark size="xs" className="tracker-header-brand__icon" decorative />
              Trackapp
            </Link>
          </div>

          <nav
            className="pointer-events-none absolute left-1/2 top-[calc(50%+0.2rem)] z-[3] hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap lg:flex lg:items-center lg:justify-center"
            aria-label="Navigation tracker"
          >
            <div className="pointer-events-auto flex items-center gap-0.5">
              {BASE_NAV.map(({ href, label }) => (
                <TrackerNavLink
                  key={href}
                  href={href}
                  className={cn(
                    "tracker-header-nav-link",
                    navActive(pathname, href) && "tracker-header-nav-link--active",
                  )}
                >
                  {label}
                </TrackerNavLink>
              ))}
              {loggedIn ? (
                <TrackerNavLink
                  href={TRACKER_WORKSPACE_HREF}
                  className={cn(
                    "tracker-header-nav-link",
                    navActive(pathname, TRACKER_WORKSPACE_HREF) && "tracker-header-nav-link--active",
                  )}
                >
                  Mon espace
                </TrackerNavLink>
              ) : (
                <button
                  type="button"
                  className="tracker-header-nav-link"
                  onClick={openAuthModal}
                >
                  Connexion
                </button>
              )}
            </div>
          </nav>

          <div
            className={cn(
              "hidden min-w-0 justify-end transition-[max-width,flex-grow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:z-[4] lg:ml-auto lg:block",
              searchOpen ? "flex-1 max-w-lg xl:max-w-xl" : "max-w-[13rem] shrink-0 flex-none xl:max-w-[14rem]",
            )}
          >
            <TrackerSearchBar
              searchSurface={searchSurface}
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              onOpen={() => setSearchOpen(true)}
            />
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 lg:hidden",
              searchOpen && "max-lg:hidden",
            )}
          >
            <button
              type="button"
              className="tracker-header-btn tracker-header-btn--search"
              aria-expanded={searchOpen}
              aria-controls="tracker-search-popover"
              data-active={searchOpen ? "true" : "false"}
              onClick={toggleSearch}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.2" />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="hidden sm:inline">Recherche</span>
            </button>
            <button
              type="button"
              className="tracker-header-menu-dot-btn"
              aria-expanded={mobileOpen}
              aria-controls={mobileId}
              onClick={() => (mobileOpen ? closeMobile() : openMobile())}
            >
              <span className="sr-only">{mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
              <svg width="18" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                key="mobile-nav-backdrop"
                type="button"
                aria-label="Fermer le menu"
                className="tracker-header-mobile-scrim lg:hidden"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={mobileBackdropTransition}
                onClick={closeMobile}
              />
              <motion.div
                key="mobile-nav"
                id={mobileId}
                initial={reduceMotion ? false : { opacity: 0, y: -28, scaleY: 0.94 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -18, scaleY: 0.97 }}
                transition={mobilePanelTransition}
                className="tracker-header-mobile-panel lg:hidden"
                style={{ transformOrigin: "top center" }}
              >
                <div className="tracker-header-mobile-panel-head">
                  <p>MENU</p>
                  <button type="button" className="tracker-header-mobile-close" onClick={closeMobile}>
                    <span className="sr-only">Fermer le menu</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <nav className="tracker-header-mobile-nav" aria-label="Navigation tracker (mobile)">
                  {BASE_NAV.map(({ href, label }) => (
                    <TrackerNavLink
                      key={href}
                      href={href}
                      className={cn(
                        "tracker-header-mobile-link",
                        navActive(pathname, href) && "tracker-header-mobile-link--active",
                      )}
                      onClick={closeMobile}
                    >
                      <span>{label}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M7 17L17 7M9 7h8v8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </TrackerNavLink>
                  ))}
                  {loggedIn ? (
                    <TrackerNavLink
                      href={TRACKER_WORKSPACE_HREF}
                      className={cn(
                        "tracker-header-mobile-link",
                        navActive(pathname, TRACKER_WORKSPACE_HREF) && "tracker-header-mobile-link--active",
                      )}
                      onClick={closeMobile}
                    >
                      <span>Mon espace</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M7 17L17 7M9 7h8v8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </TrackerNavLink>
                  ) : (
                    <button
                      type="button"
                      className="tracker-header-mobile-link w-full text-left"
                      onClick={openAuthModal}
                    >
                      <span>Connexion</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M7 17L17 7M9 7h8v8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                  <TrackerNavLink
                    href="/tracker/widget"
                    className={cn(
                      "tracker-header-mobile-link",
                      (pathname === "/tracker/widget" || pathname.startsWith("/tracker/widget/")) &&
                        "tracker-header-mobile-link--active",
                    )}
                    onClick={closeMobile}
                  >
                    <span>Extension iOS</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M7 17L17 7M9 7h8v8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </TrackerNavLink>
                </nav>

                <div className="tracker-header-mobile-actions">
                  {loggedIn ? null : (
                    <button
                      type="button"
                      className="tracker-header-mobile-login"
                      onClick={openAuthModal}
                    >
                      Connexion
                    </button>
                  )}
                  <TrackerNavLink
                    href={loggedIn ? TRACKER_WORKSPACE_HREF : "/trackapp/paiement"}
                    className="tracker-header-mobile-cta"
                    onClick={closeMobile}
                  >
                    <span>{loggedIn ? "Mon espace" : "Commencer"}</span>
                    <span className="tracker-header-mobile-cta-icon" aria-hidden>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </TrackerNavLink>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </header>
      {!loggedIn ? <TrackappAuthOverlay open={authOpen} onClose={() => setAuthOpen(false)} /> : null}
    </>
  );
}
