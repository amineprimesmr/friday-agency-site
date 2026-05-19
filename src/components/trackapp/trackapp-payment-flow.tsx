"use client";

export { TrackappPaiementMarketing as TrackappPaiementPlanPage } from "@/components/trackapp/trackapp-paiement-marketing";

import { TrackappPaiementMarketing } from "@/components/trackapp/trackapp-paiement-marketing";

/** @deprecated Utiliser TrackappPaiementMarketing — conservé pour compatibilité interne. */
export function TrackappPaymentFlow({ onClose: _onClose }: Readonly<{ onClose?: () => void }>) {
  return <TrackappPaiementMarketing />;
}
