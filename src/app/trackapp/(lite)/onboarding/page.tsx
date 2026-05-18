import { permanentRedirect } from "next/navigation";

/** Ancienne étape onboarding — redirection vers l’accueil Trackapp. */
export default async function OnboardingRemovedRedirect({
  searchParams,
}: {
  searchParams: Promise<{ app?: string | undefined }>;
}) {
  const sp = await searchParams;
  const app = typeof sp.app === "string" ? sp.app.trim() : "";
  const qs = app ? `?app=${encodeURIComponent(app)}` : "";
  permanentRedirect(`/trackapp/accueil${qs}`);
}
