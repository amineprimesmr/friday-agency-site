import type { Metadata } from "next";

import { TrackappGagner240Page } from "@/components/trackapp/trackapp-gagner-240-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gagner 240€ — Trackapp",
  description:
    "Programme d'affiliation Trackapp : parrainez vos amis et touchez 50 % de commission sur chaque abonnement (initial et renouvellements).",
};

export default async function TrackappGagner240Route() {
  const sb = await createClient();
  const user = sb ? (await sb.auth.getUser()).data.user : null;

  return <TrackappGagner240Page showDashboard={Boolean(user)} />;
}
