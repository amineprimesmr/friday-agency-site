"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface WatchedApp {
  id: string;
  name: string;
  artworkUrl: string;
  category: string;
}

const KEY = "friday_watchlist";

function load(): WatchedApp[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as WatchedApp[];
  } catch {
    return [];
  }
}

export function Watchlist() {
  const [apps, setApps] = useState<WatchedApp[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setApps(load());
    setMounted(true);
  }, []);

  function remove(id: string) {
    const next = apps.filter((a) => a.id !== id);
    setApps(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
          Ma liste de suivi
        </h2>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-white/50">
          {mounted ? apps.length : 0} apps
        </span>
      </div>

      {mounted && apps.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-white/30">Aucune app suivie.</p>
          <p className="mt-1 text-xs text-white/25">
            Ouvrez une fiche et cliquez&nbsp;★ Suivre.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => (
            <li key={app.id} className="flex items-center gap-3">
              <Link
                href={`/tracker/apps/${app.id}`}
                className="flex flex-1 items-center gap-2.5 overflow-hidden"
              >
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                  {app.artworkUrl ? (
                    <Image
                      src={app.artworkUrl}
                      alt={app.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/40">
                      {app.name.charAt(0)}
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white/80">
                    {app.name}
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {app.category}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => remove(app.id)}
                className="shrink-0 text-white/25 transition hover:text-rose-400"
                aria-label="Retirer"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <p className="text-[11px] leading-relaxed text-white/30">
          Rejoignez 5&nbsp;000+ développeurs — intel marché, livré chaque
          semaine.
        </p>
        <input
          type="email"
          placeholder="vous@email.com"
          className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-white/25"
        />
        <button
          type="button"
          className="mt-2 w-full rounded-xl bg-white/[0.08] py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.12] hover:text-white"
        >
          S&apos;abonner
        </button>
      </div>
    </div>
  );
}

/** Utilitaire exporté pour ajouter une app à la watchlist depuis n'importe quelle page */
export function addToWatchlist(app: WatchedApp) {
  try {
    const current = load();
    if (current.find((a) => a.id === app.id)) return;
    const next = [app, ...current].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function isInWatchlist(id: string): boolean {
  return load().some((a) => a.id === id);
}
