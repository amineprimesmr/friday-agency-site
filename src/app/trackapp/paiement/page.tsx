import type { Metadata } from "next";

import { TrackappPaymentPage } from "@/components/trackapp/trackapp-payment-page";

export const metadata: Metadata = {
  title: "Paiement — Trackapp",
};

export default function TrackappPaiementPage() {
  return <TrackappPaymentPage />;
}
