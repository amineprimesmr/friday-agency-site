"use client";

import Link from "next/link";

/**
 * Hors production : ouvre directement l’accueil SaaS avec données maquette (pas de login ni Supabase requis).
 */
export function TrackappDevSaasBypassButton() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="mt-10 border-t border-dashed border-white/[0.12] pt-8">
      <Link
        href="/trackapp/accueil"
        className="inline-flex rounded-xl border border-violet-500/45 bg-violet-600/25 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.22)] transition hover:bg-violet-500/35 hover:border-violet-400/55"
      >
        Ouvrir l&apos;interface SaaS (sans login)
      </Link>
    </div>
  );
}
