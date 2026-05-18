import type { Metadata } from "next";

import { createClient as createSb } from "@/lib/supabase/server";
import { stripeConfigured } from "@/lib/stripe";

import { TrackappRouteChrome } from "@/components/trackapp/trackapp-route-chrome";

import "@/styles/trackapp-fidelity-tokens.css";
import "@/styles/fidelity-port/fidelity-app.css";
import "@/styles/fidelity-port/app-desktop-topbar.css";
import "@/styles/fidelity-port/app-saas-shell.css";
import "@/styles/trackapp-main-content.css";
import "@/styles/trackapp-purple.css";
import "@/styles/trackapp-saas-pro-payment-page.css";

export const metadata: Metadata = {
  title: "Trackapp — Du concept aux prompts Xcode",
};

export default async function TrackappLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sb = await createSb();
  const user = sb ? (await sb.auth.getUser()).data.user : null;

  let planUnlocked = false;
  if (sb && user) {
    const { data: profile } = await sb
      .from("trackapp_profiles")
      .select("plan_unlocked_at")
      .eq("id", user.id)
      .maybeSingle();
    planUnlocked = Boolean(profile?.plan_unlocked_at);
  }

  const stripeReady = stripeConfigured();

  return (
    <TrackappRouteChrome
      loggedIn={Boolean(user)}
      email={user?.email ?? undefined}
      signOutHref="/trackapp/deconnexion"
      planUnlocked={planUnlocked}
      stripeReady={stripeReady}
    >
      {children}
    </TrackappRouteChrome>
  );
}
