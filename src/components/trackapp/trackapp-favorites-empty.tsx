import Link from "next/link";

import { TrackappFavoritesShell } from "@/components/trackapp/trackapp-favorites-shell";

/**
 * État vide — carte centrale bordée comme la maquette (contenu dans TrackappFavoritesShell).
 */
export function TrackappFavoritesEmpty() {
  return (
    <TrackappFavoritesShell>
      <div className="mt-12 rounded-[20px] border border-[var(--dash-border,#e2e8f0)] bg-white px-6 py-[clamp(3.25rem,10vw,5rem)] shadow-[var(--dash-shadow-lg,0_8px_28px_rgba(15,23,42,0.10))] sm:px-12 sm:py-[clamp(4rem,11vw,5.5rem)]">
        <div className="flex flex-col items-center justify-center text-center">
          <svg
            className="mb-8 h-11 w-11 text-[var(--dash-text,#1a202c)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>

          <h2 className="text-[1.35rem] font-semibold tracking-tight text-[var(--dash-text,#1a202c)] sm:text-[1.45rem]">
            Votre espace est encore vide
          </h2>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-[var(--dash-muted-light,#64748b)] sm:text-[1rem]">
            Ajoutez vos designs préférés pour y accéder rapidement.
          </p>

          <Link
            href="/trackapp/ressources"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-7 py-3.5 text-[0.95rem] font-semibold tracking-tight text-white shadow-[0_12px_32px_rgba(15,23,42,0.18)] transition hover:bg-[#111827]"
          >
            Explorer les designs
            <span aria-hidden className="text-[1.05rem] font-medium">
              →
            </span>
          </Link>
        </div>
      </div>
    </TrackappFavoritesShell>
  );
}
