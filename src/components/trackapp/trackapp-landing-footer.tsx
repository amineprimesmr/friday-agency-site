import Link from "next/link";

/** Même pied de page que les vues Trackapp « marketing » (nav + contenu + liens légaux). */
export function TrackappLandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-12 text-center text-[13px] text-white/42">
      <p className="mb-4 text-white/55">© {new Date().getFullYear()} Trackapp</p>
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link href="/tracker" className="underline-offset-4 hover:text-violet-200 hover:underline">
          App Store Tracker
        </Link>
        <Link href="/trackapp/legal/cgu" className="underline-offset-4 hover:text-violet-200 hover:underline">
          CGU
        </Link>
        <Link
          href="/trackapp/legal/confidentialite"
          className="underline-offset-4 hover:text-violet-200 hover:underline"
        >
          Confidentialité
        </Link>
      </nav>
    </footer>
  );
}
