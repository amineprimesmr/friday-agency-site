import type { VisibleRowPayload } from "@/components/trackapp/playbook-dashboard";
import { TrackappPlaybookDashboard } from "@/components/trackapp/playbook-dashboard";
import type { TrackappOnboardingAnswers } from "@/lib/trackapp/playbook";
import { buildPlaybookSteps, interpolatePrompt } from "@/lib/trackapp/playbook";

const MOCK_ANSWERS: TrackappOnboardingAnswers = {
  app_name: "Mon app iOS",
  accent_color: "#7c3aed",
  audience: "Utilisateurs iOS français",
  business_model: "freemium",
  tone: "coach",
  app_experience: "debutant",
  horizon: "",
};

/**
 * Espace playbook avec données fictives — dev sans compte Supabase.
 */
export function TrackappDevMockPlaybookView() {
  const steps = buildPlaybookSteps();
  const sourceBlock = "Pas de fiche Tracker importée.";

  const ctx: Record<string, string> = {
    app_name: String(MOCK_ANSWERS.app_name ?? ""),
    accent_color: String(MOCK_ANSWERS.accent_color ?? ""),
    audience: String(MOCK_ANSWERS.audience ?? ""),
    business_model: String(MOCK_ANSWERS.business_model ?? ""),
    tone: String(MOCK_ANSWERS.tone ?? ""),
    app_experience: String(MOCK_ANSWERS.app_experience ?? ""),
    source_block: sourceBlock,
    horizon: String(MOCK_ANSWERS.horizon ?? ""),
    source_app_nom: "",
    source_app_bundle: "",
  };

  const rowsPayload: VisibleRowPayload[] = steps.map((step) => ({
    id: step.id,
    title: step.title,
    summary: step.summary,
    prompt_template: step.prompt_template,
    promptRendered: interpolatePrompt(step.prompt_template, ctx),
    visible: true,
  }));

  return (
    <div className="relative z-[1] dashboard-main">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Workspace Trackapp</p>
        <h1 className="trackapp-workspace-hero-title">{MOCK_ANSWERS.app_name}</h1>
        <p className="trackapp-workspace-hero-desc">
          Checklist Xcode / App Store découpée en prompts prêts à coller ({steps.length} blocs).
        </p>
      </section>
      <TrackappPlaybookDashboard rows={rowsPayload} />
    </div>
  );
}
