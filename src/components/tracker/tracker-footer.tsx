import Link from "next/link";

import { trackerAuthNavItem } from "@/lib/tracker-auth-nav";

export function TrackerFooter({ loggedIn = false }: { loggedIn?: boolean }) {
  const authNav = trackerAuthNavItem(loggedIn);

  return (
    <footer className="border-t border-white/[0.08] bg-black py-12 text-sm text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
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
                <Link className="hover:text-white" href="/tracker/affiliation">
                  Affiliation
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href={authNav.href}>
                  {authNav.label}
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/trackapp/apptracker">
                  Explorer les apps
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
