import { permanentRedirect } from "next/navigation";

import { TRACKAPP_MARKETING_PATH } from "@/lib/trackapp-tools-paths";

export default function TrackappOrganiqueRedirectPage() {
  permanentRedirect(`${TRACKAPP_MARKETING_PATH}#organique`);
}
