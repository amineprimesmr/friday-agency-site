import type {
  ApplabMvpPromptBlueprint,
  ApplabPromptQualityScore,
} from "@/lib/trackapp-applab-create/mvp-prompt-types";

const REQUIRED_FUNNEL_SCREEN_IDS = [
  "welcome",
  "paywall",
  "winback_game",
  "home",
] as const;

type CheckDef = Readonly<{ id: string; label: string; pass: boolean }>;

export function scoreApplabPromptQuality(
  blueprint: ApplabMvpPromptBlueprint,
  hasReference: boolean,
  hasConstraints: boolean,
  hasResources: boolean,
): ApplabPromptQualityScore {
  const screenIds = blueprint.screens.map((s) => s.id.toLowerCase());
  const hasWelcome = screenIds.some((id) => id.includes("welcome"));
  const hasPaywall = screenIds.some((id) => id.includes("paywall"));
  const hasWinback = screenIds.some((id) => id.includes("winback") || id.includes("game"));
  const hasSettings = screenIds.some((id) => id.includes("settings") || id.includes("profil"));
  const hasHome = screenIds.some((id) => id === "home" || id.includes("main"));
  const stackBlob = [...blueprint.coding_rules, ...blueprint.folder_structure].join(" ").toLowerCase();
  const hasFirebase = stackBlob.includes("firebase") || stackBlob.includes("firestore");
  const hasRevenueCat = stackBlob.includes("revenuecat") || stackBlob.includes("purchases");

  const checks: CheckDef[] = [
    {
      id: "funnel_welcome",
      label: "Écran Welcome / Splash",
      pass: hasWelcome,
    },
    {
      id: "funnel_onboarding",
      label: "Onboarding structuré (3+ étapes)",
      pass: blueprint.onboarding_steps.length >= 3,
    },
    {
      id: "funnel_paywall",
      label: "Paywall principal",
      pass: hasPaywall,
    },
    {
      id: "funnel_winback",
      label: "Jeu remise (rejet paiement)",
      pass: hasWinback,
    },
    {
      id: "funnel_home",
      label: "App principale (home)",
      pass: hasHome,
    },
    {
      id: "settings",
      label: "Écran Settings / légal",
      pass: hasSettings,
    },
    {
      id: "screens",
      label: "8+ écrans v1.0 définis",
      pass: blueprint.screens.length >= 8,
    },
    {
      id: "data_models",
      label: "Collections Firestore (2+)",
      pass: blueprint.data_models.length >= 2,
    },
    {
      id: "firebase",
      label: "Stack Firebase (Auth, Firestore)",
      pass: hasFirebase,
    },
    {
      id: "revenuecat",
      label: "Stack RevenueCat (IAP)",
      pass: hasRevenueCat,
    },
    {
      id: "iap",
      label: "Produits IAP / paywall",
      pass: blueprint.iap_products.length >= 1 && Boolean(blueprint.paywall_trigger),
    },
    {
      id: "trackapp_resources",
      label: "Ressources Trackapp UI (ZIP)",
      pass: hasResources || blueprint.trackapp_resource_ids.length >= 3,
    },
    {
      id: "analytics",
      label: "Events analytics funnel",
      pass: blueprint.analytics_events.length >= 6,
    },
    {
      id: "execution",
      label: "Plan A→Z App Store (6+ phases)",
      pass: blueprint.execution_phases.length >= 6,
    },
    {
      id: "architecture",
      label: "Structure projet",
      pass: blueprint.folder_structure.length >= 6,
    },
    {
      id: "reference",
      label: "Référence concurrente enrichie",
      pass: hasReference,
    },
    {
      id: "constraints",
      label: "Contraintes utilisateur intégrées",
      pass: hasConstraints,
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}

export { REQUIRED_FUNNEL_SCREEN_IDS };
