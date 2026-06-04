import { TrackappOnboardingProjectBanner } from "@/components/trackapp/onboarding/trackapp-onboarding-project-banner";
import { loadOnboardingProfile } from "@/lib/trackapp-onboarding/profile-store";
import { isDiscoverOnboardingMode } from "@/lib/trackapp-onboarding/resolve-steps";
import { getTrackappUser } from "@/lib/supabase/get-trackapp-user";

/** Bandeau onboarding streamé — ne bloque pas le hero Accueil. */
export async function TrackappAccueilOnboardingSlot() {
  const { sb, user } = await getTrackappUser();
  if (!user || !sb) return null;

  const state = await loadOnboardingProfile(sb, user.id);
  if (!state.completed || !isDiscoverOnboardingMode(state.payload)) return null;

  return (
    <div className="mx-auto w-full max-w-[42rem] px-4 pt-2">
      <TrackappOnboardingProjectBanner payload={state.payload} />
    </div>
  );
}
