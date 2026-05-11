import { redirect } from "next/navigation";

import type { TrackappOnboardingAnswers } from "@/lib/trackapp/playbook";

import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/trackapp/onboarding-wizard";

type Defaults = {
  answers?: Partial<TrackappOnboardingAnswers>;
  sourceAppId?: string | null;
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string | undefined }>;
}) {
  const sp = await searchParams;
  const sb = await createClient();
  if (!sb) {
    return (
      <div className="dashboard-main relative z-[1]">
        <div className="dashboard-error">
          <p>Définissez Supabase avant l&apos;onboarding.</p>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/trackapp/connexion?next=/trackapp/onboarding");

  let defaults: Defaults = {};
  const fromUrlOrMeta = sp?.app ?? user.user_metadata?.source_app_store_id ?? null;

  const { data: profile } = await sb
    .from("trackapp_profiles")
    .select("onboarding, source_app_store_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding && typeof profile.onboarding === "object") {
    const o = profile.onboarding as Record<string, unknown>;
    defaults = {
      answers: {
        app_name: String(o.app_name ?? ""),
        accent_color: typeof o.accent_color === "string" ? o.accent_color : undefined,
        audience: String(o.audience ?? ""),
        business_model: String(o.business_model ?? ""),
        tone: String(o.tone ?? ""),
        app_experience: String(o.app_experience ?? ""),
        horizon: typeof o.horizon === "string" ? o.horizon : undefined,
      },
      sourceAppId: profile.source_app_store_id ?? fromUrlOrMeta,
    };
  } else {
    defaults = { answers: {}, sourceAppId: fromUrlOrMeta };
  }

  return (
    <div className="dashboard-main relative z-[1]">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Onboarding express</p>
        <h1 className="trackapp-workspace-hero-title">Cinq infos clés puis on génère.</h1>
        <p className="trackapp-workspace-hero-desc">Tout est français · iOS (SwiftUI) par défaut.</p>
      </section>
      <section className="trackapp-playbook-card max-w-4xl">
        <OnboardingWizard defaults={defaults} />
      </section>
    </div>
  );
}
