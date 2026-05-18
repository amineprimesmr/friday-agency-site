"use client";

import Link from "next/link";

export function TrackappNav({
  loggedIn,
  email,
  signOutHref,
}: {
  loggedIn: boolean;
  email?: string | undefined;
  signOutHref: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/72 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/tracker" className="font-semibold tracking-tight text-white">
          Trackapp
        </Link>
        <nav className="flex items-center gap-3 text-[13px] font-medium">
          <Link href="/tracker" className="hidden rounded-full px-3 py-1.5 text-white/62 transition hover:text-white sm:inline">
            Tracker
          </Link>
          {loggedIn ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-white/45 sm:inline">{email ?? ""}</span>
              <Link href="/trackapp/accueil" className="rounded-full px-4 py-2 text-violet-200 transition hover:bg-white/[0.05]">
                Accueil
              </Link>
              <Link href={signOutHref} className="rounded-full border border-white/12 px-4 py-2 text-white/80 hover:bg-white/[0.04]">
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <Link href="/trackapp/connexion" className="rounded-full px-3 py-2 text-white/68 hover:bg-white/[0.05]">
                Connexion
              </Link>
              <Link
                href="/trackapp/inscription"
                className="rounded-full border border-violet-500/35 bg-violet-500/[0.12] px-4 py-2 text-violet-100 hover:bg-violet-500/[0.2]"
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
