"use client";

import { Suspense } from "react";

import { TrackappOnboardingOverlayGate } from "@/components/trackapp/onboarding/trackapp-onboarding-overlay-gate";
import { TrackappOnboardingUiProvider } from "@/components/trackapp/onboarding/trackapp-onboarding-ui-context";
import { TrackerNavigationProvider } from "@/components/tracker/tracker-navigation";
import { TrackappFidelityWorkspaceShell } from "@/components/trackapp/trackapp-fidelity-workspace-shell";
import { TrackappUserProvider } from "@/components/trackapp/trackapp-user-context";

import "@/styles/trackapp-onboarding-overlay.css";

type Props = Readonly<{
  children: React.ReactNode;
  loggedIn: boolean;
  email?: string | undefined;
  signOutHref: string;
}>;

export function TrackappRouteChrome({
  children,
  loggedIn,
  email,
  signOutHref,
}: Props) {
  return (
    <TrackappUserProvider loggedIn={loggedIn} email={email} signOutHref={signOutHref}>
      <TrackappOnboardingUiProvider>
        <TrackerNavigationProvider>
          <TrackappFidelityWorkspaceShell loggedIn={loggedIn} email={email} signOutHref={signOutHref}>
            {children}
          </TrackappFidelityWorkspaceShell>
          <Suspense fallback={null}>
            <TrackappOnboardingOverlayGate />
          </Suspense>
        </TrackerNavigationProvider>
      </TrackappOnboardingUiProvider>
    </TrackappUserProvider>
  );
}
