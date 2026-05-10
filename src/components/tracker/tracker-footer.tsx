import Link from "next/link";

export function TrackerFooter() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-[#05050d]/60 py-8 text-xs text-white/35">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          App Store Tracker — données en temps réel via Apple RSS &amp; iTunes
          API.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/tracker" className="hover:text-white/70">Tableau de bord</Link>
          <Link href="/tracker/top-charts" className="hover:text-white/70">Classements</Link>
          <Link href="/tracker/new-releases" className="hover:text-white/70">Nouveautés</Link>
          <Link href="/tracker/search" className="hover:text-white/70">Explorer</Link>
          <Link href="/" className="hover:text-white/70">Agence Friday</Link>
        </div>
      </div>
    </footer>
  );
}
