import type { Metadata } from "next";

import { TrackappPaiementPageShell } from "@/components/trackapp/trackapp-paiement-page-shell";
import { TrackappPaiementMarketing } from "@/components/trackapp/trackapp-paiement-marketing";

export const metadata: Metadata = {
  title: "Offre Trackapp — 39 € / mois ou 99 € / an",
  description:
    "Découvre tout ce qui est inclus dans Trackapp : tracker App Store, veille, ressources, affiliation — puis finalise sur Stripe (mensuel ou annuel).",
};

export default function TrackappPaiementPageRoute() {
  return (
    <TrackappPaiementPageShell>
      <TrackappPaiementMarketing />
    </TrackappPaiementPageShell>
  );
}
