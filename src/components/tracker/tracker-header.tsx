"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/tracker", label: "Accueil", exact: true },
  { href: "/tracker/top-charts", label: "Classements" },
  { href: "/tracker/new-releases", label: "Nouveautés" },
  { href: "/tracker/search", label: "Explorer" },
];

function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    setQ("");
    router.push(`/tracker/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/40 transition hover:border-white/20 hover:text-white/70"
      >
        <span>🔍</span>
        <span className="hidden sm:inline">Rechercher une app…</span>
        <kbd className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/30 sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] backdrop-blur-sm bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <span className="text-white/40">🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nom d'app, développeur, bundle ID…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
              {q && (
                <button type="submit" className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/30">
                  Chercher
                </button>
              )}
              <kbd
                className="cursor-pointer rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/30 hover:text-white/60"
                onClick={() => setOpen(false)}
              >
                ESC
              </kbd>
            </form>
            <div className="p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Recherches rapides</p>
              <div className="flex flex-wrap gap-2">
                {["TikTok", "ChatGPT", "Duolingo", "Cal AI", "BeReal", "Spotify"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                      router.push(`/tracker/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/50 transition hover:border-white/20 hover:text-white/80"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TrackerHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05050d]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
        {/* Logo */}
        <Link href="/tracker" className="flex shrink-0 items-center gap-2 font-bold text-white">
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg ring-1 ring-white/20">
            <Image src="/assets/logo.png" alt="Friday" width={28} height={28} className="h-full w-full object-cover" priority />
          </span>
          <span className="hidden text-sm font-semibold sm:inline">App Store Tracker</span>
          <span className="ml-0.5 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/25">
            LIVE
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right — search + agence */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <GlobalSearch />
          <Link
            href="/"
            className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white sm:block"
          >
            ← Agence
          </Link>
        </div>
      </div>
    </header>
  );
}
