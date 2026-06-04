import { createClient } from "@/lib/supabase/server";
import { loadOnboardingProfile } from "@/lib/trackapp-onboarding/profile-store";
import type { TrackappUserOnboardingPayload } from "@/lib/trackapp-onboarding/types";

export type TrackappOnboardingPageProps = Readonly<{
  initialPayload: TrackappUserOnboardingPayload | null;
  initialCompleted: boolean;
  loggedIn: boolean;
  alreadyPremium: boolean;
}>;

export async function loadTrackappOnboardingPageProps(): Promise<TrackappOnboardingPageProps> {
  const sb = await createClient();
  let initialPayload: TrackappUserOnboardingPayload | null = null;
  let initialCompleted = false;
  let loggedIn = false;
  let alreadyPremium = false;

  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      loggedIn = true;
      const state = await loadOnboardingProfile(sb, user.id);
      initialPayload = state.payload;
      initialCompleted = state.completed;
      if (!initialCompleted) {
        const { data: profile } = await sb
          .from("trackapp_profiles")
          .select("plan_unlocked_at")
          .eq("id", user.id)
          .maybeSingle();
        alreadyPremium = Boolean(profile?.plan_unlocked_at);
      }
    }
  }

  return {
    initialPayload,
    initialCompleted,
    loggedIn,
    alreadyPremium,
  };
}
