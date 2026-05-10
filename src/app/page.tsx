import Link from "next/link";

/**
 * Route `/` : en production Vercel, `next.config.ts` réécrit vers la vitrine statique
 * `public/legacy-agency/index.html`. Cette page sert de point d’entrée clair en dev
 * ou si la réécriture est désactivée.
 */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-black px-6 py-16 text-center font-sans text-white">
      <div className="max-w-lg space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Friday</p>
        <h1 className="text-2xl font-semibold tracking-tight">Point d’entrée</h1>
        <p className="text-sm leading-relaxed text-white/65">
          La racine du site sert la vitrine statique en production. Choisis une entrée ci-dessous pour le
          développement local.
        </p>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-3">
        <Link
          className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/15"
          href="/legacy-agency/index.html"
        >
          Vitrine agence
        </Link>
        <Link
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/40 transition hover:bg-white/90"
          href="/tracker"
        >
          App Tracker
        </Link>
      </nav>
    </main>
  );
}
