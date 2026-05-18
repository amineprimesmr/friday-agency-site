import { permanentRedirect } from "next/navigation";

/** Ancienne étape onboarding — tout passe par l’espace playbook. */
export default async function OnboardingRemovedRedirect({
  searchParams,
}: {
  searchParams: Promise<{ app?: string | undefined }>;
}) {
  const sp = await searchParams;
  const app = typeof sp.app === "string" ? sp.app.trim() : "";
  const qs = app ? `?app=${encodeURIComponent(app)}` : "";
  permanentRedirect(`/trackapp/espace${qs}`);
}
