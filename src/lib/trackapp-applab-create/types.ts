import type {
  ApplabCreateConstraints,
  ApplabMvpStack,
  ApplabPromptVersion,
} from "@/lib/trackapp-applab-create/mvp-prompt-types";

export type ApplabCreateStepId =
  | "name"
  | "concept"
  | "audience"
  | "problem"
  | "v1_features"
  | "pricing"
  | "synthesis";

export type ApplabCreateDraft = Readonly<{
  version: 3;
  setupComplete: boolean;
  currentStep: ApplabCreateStepId;
  name: string;
  concept: string;
  clarifyingQuestions: readonly import("@/lib/trackapp-applab-project/types").ApplabClarifyingQuestion[];
  clarifyingAnswers: Readonly<Record<string, string>>;
  understanding: import("@/lib/trackapp-applab-project/types").ApplabConceptUnderstanding | null;
  assessment: import("@/lib/trackapp-applab-project/types").ApplabConceptAssessment | null;
  referenceAppId: string | null;
  referenceAppName: string | null;
  referenceAppArtworkUrl: string | null;
  referenceCountry: string;
  constraints: ApplabCreateConstraints;
  stack: ApplabMvpStack;
  promptVersions: readonly ApplabPromptVersion[];
  activePromptVersionId: string | null;
  syncedAt: string | null;
  updatedAt: string;
}>;

export const APPLAB_CREATE_STEPS: readonly Readonly<{ id: ApplabCreateStepId; label: string }>[] = [
  { id: "name", label: "Nom du projet" },
  { id: "concept", label: "Concept" },
  { id: "audience", label: "Cible" },
  { id: "problem", label: "Problème" },
  { id: "v1_features", label: "V1" },
  { id: "pricing", label: "Prix" },
  { id: "synthesis", label: "Bilan AppLAB" },
];

export const DEFAULT_APPLAB_CONSTRAINTS: ApplabCreateConstraints = {
  mustHave: "",
  mustNot: "",
};
