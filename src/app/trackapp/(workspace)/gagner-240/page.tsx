import type { Metadata } from "next";

import { TrackappGagner240Page } from "@/components/trackapp/trackapp-gagner-240-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Affiliation — Trackapp",
  description:
    "Dashboard affiliation : lien à partager, −40 % pour vos filleuls sur l'abonnement, commissions et versements.",
};

export default async function TrackappGagner240Route() {
  const sb = await createClient();
  const user = sb ? (await sb.auth.getUser()).data.user : null;

  return <TrackappGagner240Page showDashboard={Boolean(user)} />;
}
