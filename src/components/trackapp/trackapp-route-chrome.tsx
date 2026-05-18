"use client";

import { usePathname } from "next/navigation";

import { TrackappLandingFooter } from "@/components/trackapp/trackapp-landing-footer";
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
    || pathname === "/trackapp/ads"
    || pathname.startsWith("/trackapp/ads/")
    || pathname === "/trackapp/organique"
    || pathname.startsWith("/trackapp/organique/")
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

function isStandaloneAuthPath(pathname: string): boolean {
  return (
    pathname === "/trackapp/inscription"
    || pathname.startsWith("/trackapp/inscription/")
    || pathname === "/trackapp/connexion"
    || pathname.startsWith("/trackapp/connexion/")
  );
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

  if (isStandalonePaymentPath(pathname) || isStandaloneAuthPath(pathname)) {
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
        <TrackappLandingFooter />
      </div>
    </div>
  );
}
