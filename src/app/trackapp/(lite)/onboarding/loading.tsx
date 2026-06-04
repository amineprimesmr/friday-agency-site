export default function TrackappOnboardingLoading() {
  return (
    <div className="ta-onboarding ta-font" aria-busy="true" aria-label="Chargement onboarding">
      <div className="ta-onboarding__inner">
        <div className="ta-onboarding__top">
          <div className="ta-onboarding__progress">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="ta-onboarding__progress-seg is-active">
                <span className="ta-onboarding__progress-fill" />
              </div>
            ))}
          </div>
        </div>
        <div className="ta-onboarding__body">
          <div className="ta-onboarding__brand">
            <div className="ta-onboarding__brand-mark" />
            <span className="ta-onboarding__brand-name">Trackapp</span>
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
