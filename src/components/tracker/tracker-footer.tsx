import Link from "next/link";

export function TrackerFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/15 py-12 text-sm text-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-black/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-sm space-y-3">
          <p className="text-base font-semibold text-white">Friday — App Store Tracker</p>
          <p className="leading-relaxed">
            Classements iOS en temps réel : Top Charts, nouveautés, mouvements de rangs par pays et
            catégorie, creatives et publicités Meta &amp; TikTok.
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Navigation</p>
            <ul className="space-y-2">
              <li>
                <Link className="hover:text-white" href="/tracker">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/tracker/top-charts">
                  Classements
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/tracker/new-releases">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/tracker/search">
                  Explorer
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Outils</p>
            <ul className="space-y-2">
              <li>
                <Link className="hover:text-white" href="/tracker/widget">
                  Widget iOS
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/instagram.html">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-white/35 sm:px-6">
        Les données sont indicatives à des fins éducatives — elles ne constituent pas une garantie de
        performance.
      </p>
    </footer>
  );
}
