import { assembleApplabMvpPromptBundle } from "@/lib/trackapp-applab-create/build-mvp-prompt";
import { loadApplabReferenceContext } from "@/lib/trackapp-applab-create/load-reference-context";
import type {
  ApplabCreateConstraints,
  ApplabMvpPromptBlueprint,
  ApplabMvpPromptBundle,
  ApplabMvpStack,
} from "@/lib/trackapp-applab-create/mvp-prompt-types";
import { matchTrackappResourcesForPrompt } from "@/lib/trackapp-ressources/match-for-prompt";
import type {
  ApplabConceptAssessment,
  ApplabConceptUnderstanding,
} from "@/lib/trackapp-applab-project/types";
import type { CountryCode } from "@/lib/apple-charts";

/** Sans OPENAI_API_KEY en local, on génère une synthèse heuristique (prod Vercel inchangée). */
export function shouldUseApplabLocalDevFallback(): boolean {
  if (process.env.OPENAI_API_KEY?.trim()) return false;
  return process.env.VERCEL_ENV !== "production";
}

export function buildLocalApplabConceptAssessment(input: {
  name: string;
  concept: string;
  understanding: ApplabConceptUnderstanding;
}): ApplabConceptAssessment {
  const name = input.name.trim();
  const concept = input.concept.trim();
  const u = input.understanding;

  return {
    headline: name,
    summary: concept,
    how_it_works: [
      `L'utilisateur découvre ${name} via un welcome puis un onboarding court.`,
      `Le cœur de l'app : ${u.main_use_case || concept}.`,
      `Le paywall s'affiche après la première victoire utilisateur (décision Trackapp).`,
    ].join(" "),
    target_user: u.target_user,
    monetization: u.monetization,
    differentiation: [
      `Répond à : ${u.core_problem}.`,
      `Cible précise : ${u.target_user}.`,
      `Funnel Trackapp prêt App Store (SwiftUI, Firebase, RevenueCat).`,
    ].join(" "),
    mvp_features: u.key_features.length > 0 ? u.key_features : [u.main_use_case || concept],
    risks: [
      "Marché concurrentiel — différenciation UX et onboarding critiques",
      "Rétention si la valeur n'est pas démontrée avant le paywall",
      "Conformité App Review (IAP, privacy, Sign in with Apple)",
    ],
    build_prompt_seed: `${concept} · ${u.core_problem}`,
  };
}

function slugProductId(name: string): string {
  const slug =
    name
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 24) || "app";
  return `${slug}_premium_monthly`;
}

function buildLocalMvpBlueprint(input: {
  projectName: string;
  concept: string;
  understanding: ApplabConceptUnderstanding;
  assessment: ApplabConceptAssessment;
  resourceIds: readonly string[];
}): ApplabMvpPromptBlueprint {
  const name = input.projectName.trim();
  const productId = slugProductId(name);

  const screens: ApplabMvpPromptBlueprint["screens"] = [
    {
      id: "welcome",
      title: "Welcome",
      purpose: "Promesse produit et CTA Commencer",
      key_components: ["Logo", "Tagline", "Bouton Commencer"],
    },
    {
      id: "onboarding_value",
      title: "Onboarding — Valeur",
      purpose: "Démontrer le bénéfice principal en 2–3 écrans",
      key_components: ["Illustration", "Headline", "Pagination"],
    },
    {
      id: "onboarding_setup",
      title: "Onboarding — Setup",
      purpose: "Configurer le profil minimal avant le paywall",
      key_components: ["Formulaire court", "Skip optionnel", "Progress"],
    },
    {
      id: "paywall",
      title: "Paywall",
      purpose: "Abonnement RevenueCat + essai + restore",
      key_components: ["Plans", "Essai", "Restore", "Legal links"],
    },
    {
      id: "winback_game",
      title: "Winback",
      purpose: "Réengager après refus paywall",
      key_components: ["Animation", "Offre limitée", "CTA retour paywall"],
    },
    {
      id: "home",
      title: "Home",
      purpose: "Écran principal métier",
      key_components: ["Tab bar", "Contenu principal", "Actions clés"],
    },
    {
      id: "settings",
      title: "Settings",
      purpose: "Compte, abonnement, légal, support",
      key_components: ["Restore", "CGU", "Privacy", "Contact"],
    },
    {
      id: "error_offline",
      title: "Erreur / Offline",
      purpose: "États vides, erreur réseau, retry",
      key_components: ["Message", "Retry", "Offline cache hint"],
    },
  ];

  return {
    app_working_name: name,
    one_liner: input.concept.trim(),
    value_proposition: input.assessment.summary,
    screens,
    onboarding_steps: [
      {
        step: 1,
        screen_id: "onboarding_value",
        headline: "Pourquoi cette app",
        body: input.understanding.core_problem,
      },
      {
        step: 2,
        screen_id: "onboarding_setup",
        headline: "Votre profil",
        body: input.understanding.target_user,
      },
    ],
    data_models: [
      {
        name: "users",
        fields: ["uid", "displayName", "createdAt", "onboardingCompleted"],
        notes: "Firestore — doc id = Firebase Auth uid",
      },
      {
        name: "user_progress",
        fields: ["userId", "streak", "lastSessionAt", "metrics"],
        notes: "Données métier v1 — règles read/write owner only",
      },
    ],
    iap_model: input.understanding.monetization || "Freemium + abonnement",
    paywall_trigger: "Après la première victoire utilisateur (post-onboarding)",
    iap_products: [
      {
        product_id: productId,
        type: "subscription",
        label: "Premium mensuel",
        description: input.understanding.monetization || "Accès complet",
      },
    ],
    analytics_events: [
      "onboarding_started",
      "onboarding_completed",
      "paywall_viewed",
      "purchase_started",
      "purchase_completed",
      "home_first_action",
    ],
    folder_structure: [
      "App/",
      "Features/Home/",
      "Features/Onboarding/",
      "Features/Paywall/",
      "Services/Firebase/",
      "Services/RevenueCat/",
      "DesignSystem/",
    ],
    coding_rules: [
      "SwiftUI + @Observable, Firebase Auth/Firestore/Analytics/Crashlytics",
      "RevenueCat seul gestionnaire IAP — pas de StoreKit direct",
      "Sign in with Apple au paywall uniquement",
      "Loading / empty / error sur chaque flux data",
    ],
    negative_prompts: [
      "Pas de placeholder UI en release",
      "Pas de Supabase ni backend custom",
      "Pas de login obligatoire avant valeur",
    ],
    apple_compliance: [
      "Guideline 3.1.1 — IAP via App Store",
      "Privacy Nutrition Labels à jour",
      "Restore purchases accessible",
    ],
    accessibility: ["VoiceOver labels", "Dynamic Type", "Contrastes WCAG AA"],
    execution_phases: [
      "Setup Xcode + Firebase + RevenueCat",
      "Funnel welcome → onboarding → paywall → home",
      "Features métier v1 + états edge",
      "TestFlight + soumission App Store",
    ],
    trackapp_resource_ids: [...input.resourceIds],
  };
}

export async function buildLocalApplabMvpPromptBundle(input: {
  projectName: string;
  concept: string;
  stack: ApplabMvpStack;
  understanding: ApplabConceptUnderstanding;
  assessment: ApplabConceptAssessment;
  clarifications: string;
  constraints: ApplabCreateConstraints;
  referenceAppId?: string | null;
  referenceCountry?: CountryCode;
  versionNumber: number;
  versionId: string;
}): Promise<ApplabMvpPromptBundle> {
  const matchedResources = matchTrackappResourcesForPrompt({
    concept: input.concept,
    niche: input.understanding.niche,
    mvpFeatures: input.assessment.mvp_features,
  });

  const reference =
    input.referenceAppId ?
      await loadApplabReferenceContext(input.referenceAppId, input.referenceCountry ?? "fr")
    : null;

  const blueprint = buildLocalMvpBlueprint({
    projectName: input.projectName,
    concept: input.concept,
    understanding: input.understanding,
    assessment: input.assessment,
    resourceIds: matchedResources.map((r) => r.id).slice(0, 8),
  });

  return assembleApplabMvpPromptBundle(
    {
      projectName: input.projectName.trim(),
      concept: input.concept.trim(),
      stack: input.stack,
      understanding: input.understanding,
      assessment: input.assessment,
      clarifications: input.clarifications,
      constraints: input.constraints,
      reference,
      trackappResources: matchedResources,
    },
    blueprint,
    input.versionNumber,
    input.versionId,
  );
}
