import type { Metadata } from "next";

import { TrackappRouteChrome } from "@/components/trackapp/trackapp-route-chrome";
import { getTrackappUser } from "@/lib/supabase/get-trackapp-user";

import "@/styles/trackapp-fidelity-tokens.css";
import "@/styles/trackapp-appstudio-theme.css";
import "@/styles/trackapp-main-content.css";
import "@/styles/trackapp-ui-primitives.css";
import "@/styles/trackapp-purple.css";
import "@/styles/fidelity-port/fidelity-app.css";
import "@/styles/fidelity-port/app-saas-shell.css";
import "@/styles/trackapp-onboarding.css";
import "@/styles/trackapp-auth-modal.css";
import "@/styles/trackapp-activation.css";
import "@/styles/trackapp-saas-pro-payment-page.css";
import "@/styles/trackapp-paiement-landing.css";

export const metadata: Metadata = {
  title: "Trackapp — Du concept aux prompts Xcode",
};

/** Shell AppStudio global pour tout /trackapp/* */
export default async function TrackappLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getTrackappUser();

  return (
    <TrackappRouteChrome
      loggedIn={Boolean(user)}
      email={user?.email ?? undefined}
      signOutHref="/trackapp/deconnexion"
    >
      {children}
    </TrackappRouteChrome>
  );
}
