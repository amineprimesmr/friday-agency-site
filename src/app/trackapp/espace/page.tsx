import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { StripeReturnHandler } from "@/components/trackapp/stripe-return-handler";
import type { VisibleRowPayload } from "@/components/trackapp/playbook-dashboard";
import { TrackappPlaybookDashboard } from "@/components/trackapp/playbook-dashboard";

import { fetchAppDetail } from "@/lib/apple-charts";
import type { TrackappOnboardingAnswers } from "@/lib/trackapp/playbook";
import {
  buildPlaybookSteps,
  interpolatePrompt,
  previewUnlockCount,
} from "@/lib/trackapp/playbook";
import { stripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Espace playbook — Trackapp",
};

type ProfileShape = {
  onboarding: TrackappOnboardingAnswers | Record<string, unknown>;
  source_app_store_id?: string | null;
  plan_unlocked_at?: string | null;
  onboarding_completed_at?: string | null;
};

function coerceAnswers(payload: TrackappOnboardingAnswers | Record<string, unknown>): TrackappOnboardingAnswers {
  return {
    app_name: String((payload as { app_name?: string }).app_name ?? "Mon app iOS"),
    accent_color: String((payload as { accent_color?: string }).accent_color ?? "#7c3aed"),
    audience: String((payload as { audience?: string }).audience ?? "Utilisateurs iOS français"),
    business_model: String((payload as { business_model?: string }).business_model ?? "freemium"),
    tone: String((payload as { tone?: string }).tone ?? "coach"),
    app_experience: String((payload as { app_experience?: string }).app_experience ?? "debutant"),
    horizon:
      typeof (payload as { horizon?: string }).horizon === "string" ?
        (payload as { horizon?: string }).horizon
      : "",
  };
}

export default async function EspacePage() {
  const sb = await createClient();

  if (!sb) {
    return (
      <div className="dashboard-main relative z-[1]">
        <div className="dashboard-error">
          <p>Définissez Supabase puis rechargez cet espace.</p>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/trackapp/connexion?next=/trackapp/espace");

  await sb.from("trackapp_profiles").upsert({ id: user.id }).select("*").maybeSingle();

  const { data: profile } = await sb.from("trackapp_profiles").select("*").eq("id", user.id).maybeSingle();

  if (!profile) {
    return (
      <div className="dashboard-main relative z-[1]">
        <div className="dashboard-error">
          <p>
            Impossible de lire votre profil Supabase. Vérifiez la migration <code>trackapp_profiles</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!profile.onboarding_completed_at) {
    redirect("/trackapp/onboarding");
  }

  const pTyped = profile as ProfileShape;

  const answers = coerceAnswers((pTyped.onboarding ?? {}) as Record<string, unknown>);

  const sourceId = typeof pTyped.source_app_store_id === "string" ? pTyped.source_app_store_id : null;
  const appSnap = sourceId ? await fetchAppDetail(sourceId) : null;

  const sourceLines = [];
  sourceLines.push(
    appSnap ?
      `App de référence : ${appSnap.name}` +
        (appSnap.description ?
          `\nSynthèse fiche (${String(appSnap.description).slice(0, 420)})…`
        : "")
    : "Pas de fiche Tracker importée.",
  );
  if (answers.horizon) sourceLines.push(`Horizon projet : ${answers.horizon}.`);

  const sourceBlock = sourceLines.filter(Boolean).join("\n");

  const steps = buildPlaybookSteps();

  const unlocked = Boolean(pTyped.plan_unlocked_at);
  const previewLimit =
    unlocked ? steps.length : (
      previewUnlockCount(steps.length)
    );

  const ctx: Record<string, string> = {
    app_name: String(answers.app_name ?? ""),
    accent_color: String(answers.accent_color ?? ""),
    audience: String(answers.audience ?? ""),
    business_model: String(answers.business_model ?? ""),
    tone: String(answers.tone ?? ""),
    app_experience: String(answers.app_experience ?? ""),
    source_block: sourceBlock,
    horizon: answers.horizon ?? "",
    source_app_nom: appSnap?.name ?? "",
    source_app_bundle: "",
  };

  const rowsPayload: VisibleRowPayload[] = steps.map((step, idx) => {
    const rendered = interpolatePrompt(step.prompt_template, ctx);
    return {
      id: step.id,
      title: step.title,
      summary: step.summary,
      prompt_template: step.prompt_template,
      promptRendered: rendered,
      visible: idx < previewLimit,
    };
  });

  const stripeReady = stripeConfigured();

  return (
    <div className="relative z-[1] dashboard-main">
      <StripeReturnHandler />
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Workspace Trackapp</p>
        <h1 className="trackapp-workspace-hero-title">{answers.app_name}</h1>
        <p className="trackapp-workspace-hero-desc">
          Checklist Xcode / App Store découpée en prompts prêts à coller ({steps.length} blocs).
          {!unlocked ? " Tu vois un aperçu gratuit (environ 10 %) jusqu'à l'activation Stripe." : ""}
        </p>
        {!stripeReady ?
          <p className="dashboard-hint" style={{ color: "var(--dash-warning)" }}>
            Aucune clé Stripe serveur : configurez STRIPE_SECRET_KEY + STRIPE_PRICE_ID_TRACKAPP (ou
            STRIPE_PRICE_ID_MONTHLY) sur l&apos;hébergeur.
          </p>
        : null}
      </section>
      <TrackappPlaybookDashboard rows={rowsPayload} fullUnlocked={unlocked} stripeReady={stripeReady} />
    </div>
  );
}
