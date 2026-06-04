export { USER_ONBOARDING_KEY, ONBOARDING_VERSION } from "@/lib/trackapp-onboarding/keys";
export {
  buildSummaryRows,
  computeCreatorLevel,
  creatorLevelLabel,
  tipsForLevel,
} from "@/lib/trackapp-onboarding/compute-summary";
export {
  loadOnboardingProfile,
  saveOnboardingProfile,
  completeOnboardingProfile,
} from "@/lib/trackapp-onboarding/profile-store";
export { TRACKAPP_ONBOARDING_STEPS, onboardingAnswerKey } from "@/lib/trackapp-onboarding/steps";
export {
  clampStepIndex,
  getProjectModeFromAnswers,
  hasDefinedOnboardingProject,
  isDiscoverOnboardingMode,
  resolveActiveOnboardingSteps,
} from "@/lib/trackapp-onboarding/resolve-steps";
export {
  readOnboardingDraft,
  writeOnboardingDraft,
  clearOnboardingDraft,
  syncOnboardingDraftToProfile,
  isOnboardingLocallyComplete,
  markOnboardingLocallyComplete,
  ONBOARDING_DRAFT_STORAGE_KEY,
  ONBOARDING_COMPLETE_FLAG,
} from "@/lib/trackapp-onboarding/local-draft";
export type {
  OnboardingProjectMode,
  TrackappOnboardingAnswers,
  TrackappUserOnboardingPayload,
  OnboardingProfileState,
} from "@/lib/trackapp-onboarding/types";
