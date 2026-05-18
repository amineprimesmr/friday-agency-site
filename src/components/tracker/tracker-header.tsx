"use client";

import type { TrackerSearchSurface } from "@/components/tracker/tracker-search-bar";
import { TrackerSearchBar } from "@/components/tracker/tracker-search-bar";
import { TrackerLiquidGlassFilterSvg } from "@/components/tracker/tracker-liquid-glass-filter-svg";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, type CSSProperties } from "react";

import "@/styles/tracker-header.css";

/** Sections à fond clair derrière lesquelles le menu passe en encre noire */
const LIGHT_SURFACE_SELECTORS = ["#comment-ca-marche", ".tt-affiliate-shell"] as const;

const NAV = [
  { href: "/tracker", label: "Accueil" },
  { href: "/tracker/top-charts", label: "Classements" },
  { href: "/tracker/new-releases", label: "Nouveautés" },
  { href: "/tracker/affiliation", label: "Affiliation" },
] as const;

function navActive(pathname: string, href: string) {
  if (href === "/tracker") return pathname === "/tracker";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TrackerHeader({
  searchSurface,
}: {
  searchSurface?: TrackerSearchSurface;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    for (const item of NAV) {
      void router.prefetch(item.href);
    }
  }, [router]);
  const mobileId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [onLightSurface, setOnLightSurface] = useState(false);

  const onScroll = useCallback(() => {
    const y = window.scrollY || document.documentElement.scrollTop;
    setScrollProgress(Math.min(1, y / 120));
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const updateLightSurface = useCallback(() => {
    const header = document.querySelector<HTMLElement>(".tracker-header-bar");
    if (!header) return;
    const hr = header.getBoundingClientRect();
    const midY = hr.top + hr.height * 0.38;
    const midX = Math.min(Math.max(window.innerWidth * 0.5, 8), window.innerWidth - 8);
    let hit = false;
    for (const sel of LIGHT_SURFACE_SELECTORS) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.height < 4) continue;
        if (midY < r.top || midY > r.bottom) continue;
        if (midX < r.left || midX > r.right) continue;
        hit = true;
        break;
      }
      if (hit) break;
    }
    setOnLightSurface((v) => (v === hit ? v : hit));
  }, []);

  useEffect(() => {
    updateLightSurface();
    window.addEventListener("scroll", updateLightSurface, { passive: true });
    window.addEventListener("resize", updateLightSurface, { passive: true });
    const t = window.setTimeout(updateLightSurface, 80);
    return () => {
      window.removeEventListener("scroll", updateLightSurface);
      window.removeEventListener("resize", updateLightSurface);
      window.clearTimeout(t);
    };
  }, [updateLightSurface, pathname, mobileOpen, searchOpen]);

  const k = reduceMotion ? 1 : 1 + scrollProgress * 0.45;
  const blurA = reduceMotion ? 16 : 20 * k;
  const blurB = reduceMotion ? 11 : 12 * k;
  const blurC = reduceMotion ? 7 : 8 * k;
  const blurD = reduceMotion ? 4 : 5 * k;
  const blurE = reduceMotion ? 2 : 2.5 * k;

  const blurTransition = reduceMotion
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

  const mobilePanelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <TrackerLiquidGlassFilterSvg />
      <header className="tracker-header-bar fixed inset-x-0 top-0 z-[920] bg-transparent">
        <div className="tracker-header-backdrop-layers" aria-hidden>
          <div className="tracker-header-blur-a" style={layerStyle(blurA)} />
          <div className="tracker-header-blur-b" style={layerStyle(blurB)} />
          <div className="tracker-header-blur-c" style={layerStyle(blurC)} />
          <div className="tracker-header-blur-d" style={layerStyle(blurD)} />
          <div className="tracker-header-blur-e" style={layerStyle(blurE)} />
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
              className="tracker-header-brand tracker-header-mobile-brand-left lg:hidden"
              onClick={closeMobile}
            >
              Trackapp
            </Link>

            <Link
              href="/tracker"
              className="tracker-header-brand hidden shrink-0 lg:inline-flex"
              onClick={closeMobile}
            >
              Trackapp
            </Link>
          </div>

          <nav
            className="pointer-events-none absolute left-1/2 top-[calc(50%+0.2rem)] z-[3] hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap lg:flex lg:items-center lg:justify-center"
            aria-label="Navigation tracker"
          >
            <div className="pointer-events-auto flex items-center gap-0.5">
              {NAV.map(({ href, label }) => (
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
            <motion.div
              key="mobile-nav"
              id={mobileId}
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={mobilePanelTransition}
              className="tracker-header-mobile-panel relative z-[2] overflow-hidden lg:hidden"
            >
              <nav
                className="flex flex-col gap-1 px-4 pb-4 pt-1"
                aria-label="Navigation tracker (mobile)"
              >
                {NAV.map(({ href, label }) => (
                  <TrackerNavLink
                    key={href}
                    href={href}
                    className={cn(
                      "tracker-header-nav-link justify-start py-2.5 text-[0.9rem]",
                      navActive(pathname, href) && "tracker-header-nav-link--active",
                    )}
                    onClick={closeMobile}
                  >
                    {label}
                  </TrackerNavLink>
                ))}
                <TrackerNavLink
                  href="/tracker/widget"
                  className={cn(
                    "tracker-header-btn tracker-header-btn--ios-extension mt-2 inline-flex w-full items-center justify-center gap-2 py-2.5 text-[0.9rem]",
                    (pathname === "/tracker/widget" || pathname.startsWith("/tracker/widget/")) &&
                      "tracker-header-btn--ios-extension-active",
                  )}
                  onClick={closeMobile}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M9 12h6M12 9v6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  </svg>
                  Extension iOS
                </TrackerNavLink>
                <TrackerNavLink
                  href="/trackapp/connexion"
                  className="tracker-header-btn tracker-header-btn--outline mt-2 justify-center py-2.5"
                  onClick={closeMobile}
                >
                  Connexion
                </TrackerNavLink>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}
