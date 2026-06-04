export type ApplabMvpStack = "swiftui" | "expo" | "react-native" | "flutter";

/** App LAB génère uniquement des apps SwiftUI + Xcode. */
export const APPLAB_MVP_STACK: ApplabMvpStack = "swiftui";

export type ApplabCreateConstraints = Readonly<{
  mustHave: string;
  mustNot: string;
}>;

export type ApplabPromptQualityCheck = Readonly<{
  id: string;
  label: string;
  pass: boolean;
}>;

export type ApplabPromptQualityScore = Readonly<{
  score: number;
  checks: readonly ApplabPromptQualityCheck[];
}>;

export type ApplabPromptFiles = Readonly<{
  MASTER: string;
  PRODUCT_SPEC: string;
  UX_FLOWS: string;
  ARCHITECTURE: string;
  APP_STORE: string;
  RESOURCES: string;
}>;

export type ApplabMvpScreenSpec = Readonly<{
  id: string;
  title: string;
  purpose: string;
  key_components: readonly string[];
}>;

export type ApplabMvpOnboardingStep = Readonly<{
  step: number;
  screen_id: string;
  headline: string;
  body: string;
}>;

export type ApplabMvpDataModel = Readonly<{
  name: string;
  fields: readonly string[];
  notes: string;
}>;

export type ApplabMvpIapProduct = Readonly<{
  product_id: string;
  type: string;
  label: string;
  description: string;
}>;

export type ApplabMvpPromptBlueprint = Readonly<{
  app_working_name: string;
  one_liner: string;
  value_proposition: string;
  screens: readonly ApplabMvpScreenSpec[];
  onboarding_steps: readonly ApplabMvpOnboardingStep[];
  data_models: readonly ApplabMvpDataModel[];
  iap_model: string;
  paywall_trigger: string;
  iap_products: readonly ApplabMvpIapProduct[];
  analytics_events: readonly string[];
  folder_structure: readonly string[];
  coding_rules: readonly string[];
  negative_prompts: readonly string[];
  apple_compliance: readonly string[];
  accessibility: readonly string[];
  execution_phases: readonly string[];
  trackapp_resource_ids: readonly string[];
}>;

export type ApplabReferenceContext = Readonly<{
  appId: string;
  name: string;
  artistName: string;
  category: string;
  description: string;
  releaseNotes: string;
  screenshotUrls: readonly string[];
  downloadsDisplay: string;
  revenueDisplay: string;
  trackViewUrl: string;
  averageRating: string;
  fileSize: string;
  minimumOsVersion: string;
}>;

export type ApplabPromptVersion = Readonly<{
  id: string;
  version: number;
  stack: ApplabMvpStack;
  generatedAt: string;
  files: ApplabPromptFiles;
  fullPrompt: string;
  blueprint: ApplabMvpPromptBlueprint;
  quality: ApplabPromptQualityScore;
}>;

export type ApplabMvpPromptBundle = Readonly<{
  projectName: string;
  stack: ApplabMvpStack;
  files: ApplabPromptFiles;
  fullPrompt: string;
  deeplinkPrompt: string;
  markdownFilename: string;
  zipBasename: string;
  cursorDeeplink: string;
  cursorWebDeeplink: string;
  claudeDeeplink: string;
  blueprint: ApplabMvpPromptBlueprint;
  quality: ApplabPromptQualityScore;
  promptVersion: ApplabPromptVersion;
  generatedAt: string;
}>;

export type ApplabMvpPromptInput = Readonly<{
  projectName: string;
  concept: string;
  stack: ApplabMvpStack;
  understanding: import("@/lib/trackapp-applab-project/types").ApplabConceptUnderstanding;
  assessment: import("@/lib/trackapp-applab-project/types").ApplabConceptAssessment;
  clarifications: string;
  constraints: ApplabCreateConstraints;
  reference?: ApplabReferenceContext | null;
  trackappResources?: readonly import("@/lib/trackapp-ressources/catalog").TrackappResourceCatalogEntry[];
}>;

export const APPLAB_PROMPT_FILE_LABELS: Readonly<
  Record<keyof ApplabPromptFiles, { filename: string; title: string }>
> = {
  MASTER: { filename: "MASTER_PROMPT.md", title: "Prompt principal" },
  PRODUCT_SPEC: { filename: "PRODUCT_SPEC.md", title: "Spec produit" },
  UX_FLOWS: { filename: "UX_FLOWS.md", title: "Flux UX" },
  ARCHITECTURE: { filename: "ARCHITECTURE.md", title: "Architecture" },
  APP_STORE: { filename: "APP_STORE.md", title: "App Store" },
  RESOURCES: { filename: "TRACKAPP_RESOURCES.md", title: "Ressources UI" },
};
