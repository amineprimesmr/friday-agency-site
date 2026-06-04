"use client";

export function TrackappOnboardingOverlaySkeleton() {
  return (
    <div className="ta-onboarding-overlay-skeleton" aria-busy="true" aria-label="Chargement de l’onboarding">
      <div className="ta-onboarding-overlay-skeleton__promo" />
      <div className="ta-onboarding-overlay-skeleton__main">
        <div className="ta-onboarding-overlay-skeleton__bar" />
        <div className="ta-onboarding-overlay-skeleton__line ta-onboarding-overlay-skeleton__line--lg" />
        <div className="ta-onboarding-overlay-skeleton__line" />
        <div className="ta-onboarding-overlay-skeleton__line ta-onboarding-overlay-skeleton__line--sm" />
      </div>
    </div>
  );
}
