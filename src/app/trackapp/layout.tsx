import type { Metadata } from "next";

import { createClient as createSb } from "@/lib/supabase/server";

import { TrackappRouteChrome } from "@/components/trackapp/trackapp-route-chrome";

import "@/styles/trackapp-fidelity-tokens.css";
import "@/styles/trackapp-main-content.css";
import "@/styles/trackapp-purple.css";

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
