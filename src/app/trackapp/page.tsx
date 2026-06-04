import { TrackappLandingPage, trackappLandingMetadata } from "@/app/trackapp/trackapp-landing-page";

export const metadata = trackappLandingMetadata;

/** Entrée produit : `/trackapp` = AppLAB landing (pas de redirect). */
export default function TrackappRootPage() {
  return <TrackappLandingPage />;
}
