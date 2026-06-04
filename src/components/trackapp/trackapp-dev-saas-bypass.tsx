"use client";

import Link from "next/link";

import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";

type TrackappDevSaasBypassVariant = "footer" | "hero";

/**
 * Hors production : ouvre directement l’accueil SaaS avec données maquette (pas de login ni Supabase requis).
 */
export function TrackappDevSaasBypassButton({
  variant = "footer",
}: {
  variant?: TrackappDevSaasBypassVariant;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (variant === "hero") {
    return (
      <Link
        href={TRACKAPP_ACCUEIL_BASE}
        className="mt-5 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 py-2.5 text-[13px] font-semibold text-zinc-200 transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white"
      >
        Accéder au SaaS sans connexion
      </Link>
    );
  }

  return (
    <div className="mt-10 border-t border-dashed border-white/[0.12] pt-8">
      <Link
        href={TRACKAPP_ACCUEIL_BASE}
        className="inline-flex rounded-xl border border-violet-500/45 bg-violet-600/25 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.22)] transition hover:bg-violet-500/35 hover:border-violet-400/55"
      >
        Ouvrir l&apos;interface SaaS (sans login)
      </Link>
    </div>
  );
}
