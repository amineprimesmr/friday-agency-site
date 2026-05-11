"use client";

import Link from "next/link";

/** Bloc Client : la page Tracker est un Server Component ; pas d'onClick dedans. */
export function TrackerHeroTrackappCtas() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 px-2 sm:mt-11">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center sm:gap-5">
        <Link
          href="/trackapp/inscription?mode=start"
          className="ta-cta-purple ta-cta-purple--ghost w-full justify-center px-10 py-4 text-center sm:w-auto sm:max-w-none"
        >
          Commencer sans modèle
        </Link>
        <Link
          href="/tracker/search"
          className="ta-cta-purple w-full justify-center px-10 py-4 text-center sm:w-auto sm:max-w-none"
        >
          Copier une app
        </Link>
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("trackapp-intro-open"))}
        className="text-center text-[13px] font-medium text-violet-300/90 underline underline-offset-4 transition hover:text-violet-100"
      >
        Trackapp — à la place de l&apos;ancienne invite « extension gratuite »
      </button>
    </div>
  );
}
