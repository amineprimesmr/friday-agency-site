import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";
import {
  resolveOnboardingReturnHref,
  trackappOnboardingOverlayHref,
} from "@/lib/trackapp-onboarding-overlay";

export const metadata: Metadata = {
  title: "Onboarding — Trackapp",
  description: "Configurez votre profil créateur et votre premier projet d'app.",
};

/** Redirige vers l’overlay sur la landing (la page courante reste visible en arrière-plan). */
export default async function TrackappOnboardingPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const sp = await searchParams;
  const returnPath = resolveOnboardingReturnHref(sp, TRACKAPP_LANDING_PATH);
  redirect(trackappOnboardingOverlayHref(TRACKAPP_LANDING_PATH, returnPath));
}
