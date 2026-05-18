import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { StripeReturnHandler } from "@/components/trackapp/stripe-return-handler";
import type { VisibleRowPayload } from "@/components/trackapp/playbook-dashboard";
import { TrackappPlaybookDashboard } from "@/components/trackapp/playbook-dashboard";

import { fetchAppDetail } from "@/lib/apple-charts";
import type { TrackappOnboardingAnswers } from "@/lib/trackapp/playbook";
import { buildPlaybookSteps, interpolatePrompt } from "@/lib/trackapp/playbook";
import { TrackappDevMockPlaybookView } from "@/lib/trackapp/dev-mock-playbook";
import { createClient } from "@/lib/supabase/server";

const LOCAL_UI_WITHOUT_ACCOUNT = process.env.NODE_ENV !== "production";
const APP_DETAIL_RENDER_BUDGET_MS = 350;

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

async function fetchAppDetailWithinRenderBudget(sourceId: string) {
  if (!sourceId) return null;

  return Promise.race([
    fetchAppDetail(sourceId),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), APP_DETAIL_RENDER_BUDGET_MS);
    }),
  ]);
}

export default async function EspacePage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string | undefined }>;
}) {
  const sp = await searchParams;
  const qsApp = typeof sp?.app === "string" ? sp.app.trim() : "";

  const sb = await createClient();

  if (LOCAL_UI_WITHOUT_ACCOUNT && !sb) {
    return <TrackappDevMockPlaybookView />;
  }

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
  if (!user) {
    if (LOCAL_UI_WITHOUT_ACCOUNT) return <TrackappDevMockPlaybookView />;
    redirect("/trackapp/connexion?next=/trackapp/espace");
  }

  await sb.from("trackapp_profiles").upsert({ id: user.id }).select("*").maybeSingle();

  let { data: profile } = await sb.from("trackapp_profiles").select("*").eq("id", user.id).maybeSingle();

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

  const meta =
    user.user_metadata && typeof user.user_metadata.source_app_store_id === "string"
      ? user.user_metadata.source_app_store_id.trim()
      : "";

  const existingSource =
    typeof profile.source_app_store_id === "string" && profile.source_app_store_id.trim() ?
      profile.source_app_store_id.trim()
    : "";

  const resolvedSource = qsApp || existingSource || meta || "";
  const incomingExplicit = qsApp || meta || "";

  const needsPatch =
    !profile.onboarding_completed_at || Boolean(incomingExplicit && incomingExplicit !== existingSource);

  if (needsPatch) {
    await sb.from("trackapp_profiles").upsert({
      id: user.id,
      ...(resolvedSource ? { source_app_store_id: resolvedSource } : {}),
      ...(!profile.onboarding_completed_at ?
        { onboarding_completed_at: new Date().toISOString() }
      : {}),
    });
    const { data: refetched } = await sb.from("trackapp_profiles").select("*").eq("id", user.id).maybeSingle();
    if (refetched) profile = refetched;
  }

  const pTyped = profile as ProfileShape;

  const answers = coerceAnswers((pTyped.onboarding ?? {}) as Record<string, unknown>);

  const sourceId = typeof pTyped.source_app_store_id === "string" ? pTyped.source_app_store_id.trim() : "";
  const appSnap = await fetchAppDetailWithinRenderBudget(sourceId);

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

  const rowsPayload: VisibleRowPayload[] = steps.map((step) => {
    const rendered = interpolatePrompt(step.prompt_template, ctx);
    return {
      id: step.id,
      title: step.title,
      summary: step.summary,
      prompt_template: step.prompt_template,
      promptRendered: rendered,
      visible: true,
    };
  });

  return (
    <div className="relative z-[1] dashboard-main">
      <StripeReturnHandler />
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Workspace Trackapp</p>
        <h1 className="trackapp-workspace-hero-title">{answers.app_name}</h1>
        <p className="trackapp-workspace-hero-desc">
          Checklist Xcode / App Store découpée en prompts prêts à coller ({steps.length} blocs).
        </p>
      </section>
      <TrackappPlaybookDashboard rows={rowsPayload} />
    </div>
  );
}
