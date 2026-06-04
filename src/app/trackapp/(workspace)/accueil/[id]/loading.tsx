import {
  TrackappAccueilAnalysisRoot,
  TrackappAnalysisLoading,
  TrackappAnalysisStatusBar,
} from "@/components/trackapp/trackapp-accueil-analysis";

export default function TrackappAccueilAppLoading() {
  return (
    <TrackappAccueilAnalysisRoot appName="…">
      <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement de la fiche app">
        <TrackappAnalysisStatusBar />

        <div className="mb-3 flex justify-between gap-3">
          <div className="trackapp-analysis-shimmer h-10 w-28 rounded-full" />
          <div className="trackapp-analysis-shimmer h-5 w-24 rounded" />
        </div>

        <section className="trackapp-analysis-block trackapp-analysis-block__scan overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
            <div className="trackapp-analysis-shimmer h-28 w-28 shrink-0 rounded-[28px]" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="trackapp-analysis-shimmer h-3 w-16 rounded" />
              <div className="trackapp-analysis-shimmer h-12 w-full max-w-md rounded-xl" />
              <div className="trackapp-analysis-shimmer h-5 w-48 rounded" />
              <div className="flex flex-wrap gap-2 pt-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="trackapp-analysis-shimmer h-7 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <TrackappAnalysisLoading stepId="metrics" />
        <TrackappAnalysisLoading stepId="iap" />
        <TrackappAnalysisLoading stepId="social" />
      </div>
    </TrackappAccueilAnalysisRoot>
  );
}
