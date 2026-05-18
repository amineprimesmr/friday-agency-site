import { permanentRedirect } from "next/navigation";

/** L’unique entrée publique « vitrine » est le Tracker (`/` → `/tracker`). */
export default function TrackappMarketingRemovedRedirect() {
  permanentRedirect("/tracker");
}
