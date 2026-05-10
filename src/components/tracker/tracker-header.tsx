"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function trackerNavActiveIndex(pathname: string): number {
  const normalized = pathname.replace(/\/$/, "") || "/tracker";
  if (normalized === "/tracker") return 0;
  if (pathname.startsWith("/tracker/top-charts")) return 1;
  if (pathname.startsWith("/tracker/new-releases")) return 2;
  if (pathname.startsWith("/tracker/search")) return 3;
  if (
    pathname.startsWith("/tracker/apps/") ||
    pathname.startsWith("/tracker/developer/") ||
    pathname.startsWith("/tracker/widget")
  ) {
    return 3;
  }
  return 0;
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  );
}

function IconCharts({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V5M4 19h16M8 17v-5m4 5V8m4 9v-3"
      />
    </svg>
  );
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 14 9h6l-5 3.5L17 21l-5-3.5L7 21l2-8.5L4 9h6l2-6Z"
      />
    </svg>
  );
}

function IconExplore({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}

const nav = [
  { href: "/tracker", label: "Accueil", exact: true, Icon: IconHome },
  { href: "/tracker/top-charts", label: "Classements", exact: false, Icon: IconCharts },
  { href: "/tracker/new-releases", label: "Nouveautés", exact: false, Icon: IconSpark },
  { href: "/tracker/search", label: "Explorer", exact: false, Icon: IconExplore },
] as const;

/* ── Search modal ─────────────────────────────────────────────────────────── */
function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 30);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    onClose();
    router.push(`/tracker/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]"
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(5,5,13,0.65)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{
          borderRadius: "1.25rem",
          background: "color-mix(in srgb, #bbbbbc 14%, transparent)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          boxShadow: `
            inset 0 0 0 1px color-mix(in srgb, #fff 14%, transparent),
            inset 1.8px 3px 0 -2px color-mix(in srgb, #fff 35%, transparent),
            inset -2px -2px 0 -2px color-mix(in srgb, #fff 28%, transparent),
            0 10px 40px rgba(0,0,0,0.55)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="text-base text-white/40">🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom d'app, développeur, bundle ID…"
            className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/35 outline-none"
          />
          {q && (
            <button type="submit" className="site-header-liquid__cta-gradient px-3 py-1.5 text-[11px]">
              Chercher
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-white/30 transition hover:text-white/60"
          >
            ESC
          </button>
        </form>

        <div className="px-5 py-4">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/25">
            Recherches rapides
          </p>
          <div className="flex flex-wrap gap-2">
            {["TikTok", "ChatGPT", "Duolingo", "Cal AI", "Spotify", "BeReal"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/tracker/search?q=${encodeURIComponent(term)}`);
                }}
                className="site-header-liquid__link text-[12px]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Header ───────────────────────────────────────────────────────────────── */
export function TrackerHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const activeIndex = useMemo(() => trackerNavActiveIndex(pathname), [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <header className={`top-glass-bar${scrolled ? " is-scrolled" : ""}`} aria-label="Navigation App Tracker">
        {/* Calques réels : backdrop-filter sur pseudo-éléments est souvent cassé (Safari / WebKit prod). */}
        <div className="top-glass-bar__frost" aria-hidden />
        <div className="top-glass-bar__sheen" aria-hidden />
        <div className="top-glass-menu">
          <Link href="/tracker" className="site-logo site-logo--menu" aria-label="App Tracker — accueil">
            <Image src="/assets/logo.png" alt="" width={30} height={30} className="site-logo__img" priority />
          </Link>

          <div id="tracker-liquid-glass" className="tracker-switcher-host">
            <fieldset
              className="tracker-switcher"
              style={
                {
                  "--active-index": activeIndex,
                } as React.CSSProperties
              }
            >
              <legend className="tracker-switcher__legend">Navigation App Tracker</legend>
              {nav.map((item) => {
                const active = item.exact
                  ? pathname.replace(/\/$/, "") === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.Icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="tracker-switcher__link"
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="tracker-switcher__icon" />
                    <span className="tracker-switcher__text">{item.label}</span>
                  </Link>
                );
              })}
            </fieldset>
          </div>

          <span className="top-glass-menu__divider hidden min-[420px]:block" aria-hidden />

          <div className="top-glass-menu__actions">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="site-header-liquid__cta-glass hidden items-center gap-2 min-[420px]:flex"
              aria-label="Rechercher"
            >
              <span className="text-sm">🔍</span>
              <span className="hidden text-[0.8125rem] lg:inline">Rechercher</span>
              <kbd
                className="hidden rounded-md px-1.5 py-0.5 text-[10px] font-semibold lg:inline"
                style={{
                  background: "color-mix(in srgb, #fff 10%, transparent)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="site-header-liquid__cta-glass flex items-center min-[420px]:hidden"
              aria-label="Rechercher"
            >
              <span className="text-sm">🔍</span>
            </button>

            <Link
              href="/"
              className="site-header-liquid__cta-gradient inline-flex items-center justify-center text-center"
            >
              Agence
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
