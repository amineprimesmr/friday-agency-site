import { redirect } from "next/navigation";

/** Ancienne page Ads — redirige vers Apptracker (présence officielle). */
export default function TrackappAdsPage() {
  redirect("/trackapp/apptracker");
}
