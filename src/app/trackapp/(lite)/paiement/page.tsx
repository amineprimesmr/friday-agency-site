import type { Metadata } from "next";

import { TrackappPaiementMarketing } from "@/components/trackapp/trackapp-paiement-marketing";
import { TrackappPaiementPageShell } from "@/components/trackapp/trackapp-paiement-page-shell";

export const metadata: Metadata = {
  title: "Offre Trackapp — 29 € / mois ou 59 € à vie",
  description:
    "Découvre tout ce qui est inclus dans Trackapp : tracker App Store, veille, ressources, affiliation — puis finalise sur Stripe (mensuel ou accès à vie).",
};

export default function TrackappPaiementPageRoute() {
  return (
    <TrackappPaiementPageShell>
      <TrackappPaiementMarketing />
    </TrackappPaiementPageShell>
  );
}
