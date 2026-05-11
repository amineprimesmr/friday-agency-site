"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TrackappNav } from "@/components/trackapp/trackapp-nav";

type Props = Readonly<{
  children: React.ReactNode;
  loggedIn: boolean;
  email?: string | undefined;
  signOutHref: string;
}>;

function isWorkspacePath(pathname: string): boolean {
  return (
    pathname === "/trackapp/espace"
    || pathname.startsWith("/trackapp/espace/")
    || pathname === "/trackapp/onboarding"
    || pathname.startsWith("/trackapp/onboarding/")
  );
}

export function TrackappRouteChrome({ children, loggedIn, email, signOutHref }: Props) {
  const pathname = usePathname() ?? "";
  const workspace = isWorkspacePath(pathname);

  if (workspace) {
    return (
      <div className="trackapp-fidelity-dash">
        <header className="dashboard-header">
          <div className="dashboard-header-inner">
            <Link href="/trackapp" className="dashboard-logo">
              Trackapp
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-4">
              <Link href="/tracker" className="trackapp-header-link">
                Tracker
              </Link>
              {loggedIn ?
                <>
                  {email ?
                    <span className="dashboard-title hidden max-w-[10rem] truncate sm:inline" title={email}>
                      {email}
                    </span>
                  : null}
                  <Link href="/trackapp/espace" className="trackapp-btn-ghost-dash">
                    Espace
                  </Link>
                  <Link href={signOutHref} className="trackapp-header-link">
                    Déconnexion
                  </Link>
                </>
              : <>
                  <Link href="/trackapp/connexion" className="trackapp-header-link">
                    Connexion
                  </Link>
                  <Link href="/trackapp/inscription" className="trackapp-header-btn-outline">
                    Inscription
                  </Link>
                </>
              }
            </nav>
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="ta-font min-h-dvh bg-black text-white antialiased">
      <div className="ta-glow-bg min-h-dvh">
        <TrackappNav loggedIn={loggedIn} email={email} signOutHref={signOutHref} />
        {children}
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
      </div>
    </div>
  );
}
