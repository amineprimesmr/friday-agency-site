import type { Metadata } from "next";

import { TrackappApplabCreateExperience } from "@/components/trackapp/applab-create/trackapp-applab-create-experience";
import {
  listAppShowcaseVideoItemsEnriched,
  listAppShowcaseVideoItemsFallbackEnriched,
} from "@/lib/showcase-app-videos-enrich";
import { createClient } from "@/lib/supabase/server";
import { hasDefinedOnboardingProject } from "@/lib/trackapp-onboarding/resolve-steps";
import { loadOnboardingProfile } from "@/lib/trackapp-onboarding/profile-store";

export const trackappLandingMetadata: Metadata = {
  title: "Créez votre prochaine app — Trackapp",
  description:
    "Parcours guidé AppLAB : nom, concept, questions et synthèse. Essayez Trackapp gratuitement, puis connectez-vous pour le SaaS complet.",
};

export async function TrackappLandingPage() {
  let initialName = "";
  let initialConcept = "";

  const sb = await createClient();
  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      const state = await loadOnboardingProfile(sb, user.id);
      const payload = state.payload;
      if (payload && hasDefinedOnboardingProject(payload)) {
        initialName = payload.project?.name?.trim() ?? "";
        const goal = payload.answers.monetization_model?.replace(/_/g, " ");
        if (goal) initialConcept = `Objectif Trackapp : ${goal}.`;
      }
    }
  }

  const showcaseVideos = await listAppShowcaseVideoItemsEnriched().catch(() =>
    listAppShowcaseVideoItemsFallbackEnriched(),
  );

  return (
    <TrackappApplabCreateExperience
      initialName={initialName}
      initialConcept={initialConcept}
      showcaseVideos={showcaseVideos}
    />
  );
}
