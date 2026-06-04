import { redirect } from "next/navigation";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";

export default function Home() {
  redirect(TRACKAPP_LANDING_PATH);
}
