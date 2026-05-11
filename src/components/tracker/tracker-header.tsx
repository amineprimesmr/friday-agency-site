"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const nav = [
  { href: "/tracker", label: "Accueil", exact: true },
  { href: "/tracker/top-charts", label: "Classements", exact: false },
  { href: "/tracker/new-releases", label: "Nouveautés", exact: false },
  { href: "/tracker/search", label: "Explorer", exact: false },
] as const;

function isActive(item: (typeof nav)[number], pathname: string) {
  if (item.exact) return pathname.replace(/\/$/, "") === item.href;
  return (
    pathname.startsWith(item.href) ||
    (item.href === "/tracker/search" &&
      (pathname.startsWith("/tracker/apps/") ||
        pathname.startsWith("/tracker/developer/") ||
        pathname.startsWith("/tracker/widget")))
  );
}

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
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(5,5,13,0.65)",
      }}
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

  return (
    <>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <header className="site-header-bar" aria-label="Navigation Friday Tracker">
        <div className="site-header-bar__inner">
          <div className="site-header-liquid">
            {/* Logo */}
            <Link
              href="/tracker"
              className="group flex shrink-0 items-center gap-2 rounded-full py-1 pl-0.5 pr-1 font-semibold tracking-tight text-white focus-visible:outline-none"
            >
              <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-[1.04]">
                <Image
                  src="/assets/logo.png"
                  alt="Friday"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  priority
                />
              </span>
              <span className="hidden pr-1 text-[0.95rem] sm:inline">Friday</span>
            </Link>

            <span className="site-header-liquid__divider site-header-liquid__divider--nav" aria-hidden />

            {/* Nav */}
            <nav className="site-header-liquid__nav" aria-label="Navigation principale">
              {nav.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="site-header-liquid__link"
                    style={
                      active
                        ? {
                            color: "#fff",
                            backgroundColor: "color-mix(in srgb, #fff 10%, transparent)",
                          }
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <span className="site-header-liquid__divider hidden sm:block" aria-hidden />

            {/* Actions */}
            <div className="site-header-liquid__actions">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="site-header-liquid__cta-glass hidden items-center gap-2 sm:inline-flex"
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
                className="site-header-liquid__cta-glass flex items-center sm:hidden"
                aria-label="Rechercher"
              >
                <span className="text-sm">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
