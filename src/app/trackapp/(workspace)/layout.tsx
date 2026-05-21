import { createClient as createSb } from "@/lib/supabase/server";

import { TrackappRouteChrome } from "@/components/trackapp/trackapp-route-chrome";

import "@/styles/fidelity-port/fidelity-app.css";
import "@/styles/fidelity-port/app-desktop-topbar.css";
import "@/styles/fidelity-port/app-saas-shell.css";

export default async function TrackappWorkspaceGroupLayout({
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
