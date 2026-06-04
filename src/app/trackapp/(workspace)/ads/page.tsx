import { permanentRedirect } from "next/navigation";

import { TRACKAPP_MARKETING_PATH } from "@/lib/trackapp-tools-paths";

export default function TrackappAdsRedirectPage() {
  permanentRedirect(`${TRACKAPP_MARKETING_PATH}#ads`);
}
