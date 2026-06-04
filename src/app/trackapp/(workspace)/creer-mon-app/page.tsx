import { redirect } from "next/navigation";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";

/** Legacy — Formation / creer-mon-app → AppLAB Créer une app. */
export default function TrackappCreerMonAppRedirect() {
  redirect(TRACKAPP_LANDING_PATH);
}
