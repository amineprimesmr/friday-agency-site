import Link from "next/link";

export function TrackappAccueilLanding() {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <h1 className="text-balance text-[2rem] font-bold leading-[1.15] tracking-tight text-[var(--dash-text,#1a202c)] sm:text-[2.35rem] md:text-[2.75rem]">
        Recherchez n&apos;importe quel app, obtenez des insights instantanés
      </h1>
      <p className="mt-5 max-w-[540px] text-pretty text-[1.05rem] leading-relaxed text-[var(--dash-muted-light,#64748b)] italic">
        Explorez les classements et signaux publics de l&apos;App&nbsp;Store.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/trackapp/creer-mon-app"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0f172a] px-7 text-[0.95rem] font-bold tracking-tight text-white no-underline shadow-[0_14px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-[#111827]"
        >
          Créer mon app
        </Link>
        <Link
          href="/trackapp/logiciels"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-[0.95rem] font-bold tracking-tight text-slate-900 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          Voir les logiciels
        </Link>
      </div>
    </div>
  );
}
