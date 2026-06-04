import { redirect } from "next/navigation";

import { TRACKAPP_RESSOURCES_PATH } from "@/lib/trackapp-tools-paths";

export default function TrackappFavorisRessourcesPage() {
  redirect(TRACKAPP_RESSOURCES_PATH);
}
