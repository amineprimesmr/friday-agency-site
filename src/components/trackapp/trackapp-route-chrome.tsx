"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TrackappFidelityWorkspaceShell } from "@/components/trackapp/trackapp-fidelity-workspace-shell";
import { TrackappNav } from "@/components/trackapp/trackapp-nav";

type Props = Readonly<{
  children: React.ReactNode;
  loggedIn: boolean;
  email?: string | undefined;
  signOutHref: string;
  planUnlocked: boolean;
  stripeReady: boolean;
}>;

function isWorkspacePath(pathname: string): boolean {
  return (
    pathname === "/trackapp/accueil"
    || pathname.startsWith("/trackapp/accueil/")
    || pathname === "/trackapp/apptracker"
    || pathname.startsWith("/trackapp/apptracker/")
    || pathname === "/trackapp/creer-mon-app"
    || pathname.startsWith("/trackapp/creer-mon-app/")
    || pathname === "/trackapp/espace"
    || pathname.startsWith("/trackapp/espace/")
    || pathname === "/trackapp/logiciels"
    || pathname.startsWith("/trackapp/logiciels/")
    || pathname === "/trackapp/ressources"
    || pathname.startsWith("/trackapp/ressources/")
    || pathname === "/trackapp/favoris"
    || pathname.startsWith("/trackapp/favoris/")
    || pathname === "/trackapp/gagner-240"
    || pathname.startsWith("/trackapp/gagner-240/")
  );
}

function isStandalonePaymentPath(pathname: string): boolean {
  return pathname === "/trackapp/paiement" || pathname.startsWith("/trackapp/paiement/");
}

export function TrackappRouteChrome({
  children,
  loggedIn,
  email,
  signOutHref,
  planUnlocked,
  stripeReady,
}: Props) {
  const pathname = usePathname() ?? "";
  const workspace = isWorkspacePath(pathname);

  if (isStandalonePaymentPath(pathname)) {
    return <>{children}</>;
  }

  if (workspace) {
    return (
      <TrackappFidelityWorkspaceShell
        loggedIn={loggedIn}
        email={email}
        signOutHref={signOutHref}
        planUnlocked={planUnlocked}
        stripeReady={stripeReady}
      >
        {children}
      </TrackappFidelityWorkspaceShell>
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
