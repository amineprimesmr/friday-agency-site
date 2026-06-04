import { TRACKAPP_ONBOARDING_STEPS } from "@/lib/trackapp-onboarding/steps";
import type {
  OnboardingProjectMode,
  OnboardingStep,
  TrackappOnboardingAnswers,
  TrackappUserOnboardingPayload,
} from "@/lib/trackapp-onboarding/types";

export function getProjectModeFromAnswers(
  answers: TrackappOnboardingAnswers,
): OnboardingProjectMode | null {
  if (answers.project_status === "has_project") return "defined";
  if (answers.project_status === "no_project") return "discover";
  return null;
}

export function hasDefinedOnboardingProject(
  payload: TrackappUserOnboardingPayload | null | undefined,
): boolean {
  if (!payload) return false;
  if (payload.projectMode === "defined") return Boolean(payload.project?.name?.trim());
  return getProjectModeFromAnswers(payload.answers) === "defined" && Boolean(payload.project?.name?.trim());
}

export function isDiscoverOnboardingMode(
  payload: TrackappUserOnboardingPayload | null | undefined,
): boolean {
  if (!payload) return false;
  if (payload.projectMode === "discover") return true;
  return getProjectModeFromAnswers(payload.answers) === "discover";
}

export function resolveActiveOnboardingSteps(
  answers: TrackappOnboardingAnswers,
): readonly OnboardingStep[] {
  const mode = getProjectModeFromAnswers(answers);

  return TRACKAPP_ONBOARDING_STEPS.filter((step) => {
    if (!step.branch) return true;
    if (!mode) return false;
    return step.branch === mode;
  });
}

export function clampStepIndex(
  answers: TrackappOnboardingAnswers,
  index: number,
): number {
  const steps = resolveActiveOnboardingSteps(answers);
  if (steps.length === 0) return 0;
  return Math.max(0, Math.min(index, steps.length - 1));
}

export function stepIndexById(
  answers: TrackappOnboardingAnswers,
  stepId: string,
): number {
  const steps = resolveActiveOnboardingSteps(answers);
  const idx = steps.findIndex((s) => s.id === stepId);
  return idx >= 0 ? idx : 0;
}
