import type { CreatorLevel, OnboardingProjectMode, TrackappOnboardingAnswers } from "@/lib/trackapp-onboarding/types";
import { TRACKAPP_ONBOARDING_STEPS } from "@/lib/trackapp-onboarding/steps";
import { getProjectModeFromAnswers } from "@/lib/trackapp-onboarding/resolve-steps";

function labelFor(stepId: string, answerId: string | undefined): string {
  if (!answerId) return "—";
  const step = TRACKAPP_ONBOARDING_STEPS.find((s) => s.id === stepId);
  const opt = step?.options?.find((o) => o.id === answerId);
  return opt?.label ?? answerId;
}

export function computeCreatorLevel(answers: TrackappOnboardingAnswers): CreatorLevel {
  const exp = answers.experience;
  const rev = answers.revenue_goal;

  if (exp === "pro" || rev === "10k+") return "top";
  if (exp === "shipped" || rev === "3k-7k") return "upper";
  if (exp === "learning" || rev === "1k-3k") return "mid";
  return "beginner";
}

export function creatorLevelLabel(level: CreatorLevel): string {
  if (level === "top") return "Top";
  if (level === "upper") return "Upper";
  if (level === "mid") return "Mid";
  return "Beginner";
}

export function tipsForLevel(level: CreatorLevel, mode: OnboardingProjectMode | null): readonly string[] {
  if (mode === "discover") {
    if (level === "beginner") {
      return [
        "Explorez Apptracker — shortlist des apps qui performent, puis analysez avec AppLAB.",
        "Favorisez les apps avec abonnements clairs et peu de concurrence.",
        "Quand vous validez une niche, créez votre workspace projet dans Trackapp.",
      ];
    }
    return [
      "Pipeline découverte : shortlist 5 apps, analyse AppLAB, gardez 1 angle.",
      "Comparez IAP et pays de lancement avant de vous engager.",
      "Nommez votre projet dès que l'opportunité est validée — AppLAB devient votre hub.",
    ];
  }

  if (level === "beginner") {
    return [
      "Liez votre projet à une app référence dans AppTracker pour l'analyser dans AppLAB.",
      "Visez un MVP en 2 semaines : 3 écrans, un paywall simple.",
      "Utilisez l'export Cursor/Claude dès le jour 1 pour ne pas rester bloqué.",
    ];
  }
  if (level === "mid") {
    return [
      "Comparez 3 apps concurrentes à votre projet — le whitespace est dans AppLAB.",
      "Testez 2 angles de monétisation (essai gratuit vs paywall direct).",
      "Planifiez votre visibilité App Store + 5 pays de lancement dès la v1.",
    ];
  }
  if (level === "upper") {
    return [
      "Pipeline : 1 app en analyse, 1 en build, 1 en marketing en parallèle.",
      "Automatisez la recherche avec AppTracker + favoris par niche.",
      "Documentez vos prompts gagnants dans l'export AppLAB.",
    ];
  }
  return [
    "Scalez les formats qui convertissent — clonez le playbook, pas l'app.",
    "Déléguez le build IA, concentrez-vous sur distribution et pricing.",
    "Trackez les MRR par app et coupez vite ce qui ne performe pas à M+2.",
  ];
}

export type SummaryRow = Readonly<{ icon: string; label: string; value: string }>;

export function buildSummaryRows(answers: TrackappOnboardingAnswers): readonly SummaryRow[] {
  const mode = getProjectModeFromAnswers(answers);
  const rows: SummaryRow[] = [
    {
      icon: mode === "defined" ? "🚀" : "🔍",
      label: "Parcours",
      value: mode === "defined" ? "Projet défini" : mode === "discover" ? "Exploration apps" : "—",
    },
    { icon: "✨", label: "Expérience", value: labelFor("experience", answers.experience) },
    { icon: "🎯", label: "Blocage", value: labelFor("frustration", answers.frustration) },
  ];

  if (mode === "defined") {
    rows.push({ icon: "📋", label: "Stade", value: labelFor("project_stage", answers.project_stage) });
  }

  if (answers.monetization_model) {
    rows.push({
      icon: "💰",
      label: "Monétisation",
      value: labelFor("monetization_model", answers.monetization_model),
    });
  }

  return rows;
}
