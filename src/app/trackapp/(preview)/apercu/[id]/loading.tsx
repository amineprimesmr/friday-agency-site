import {
  TrackappAccueilAnalysisRoot,
  TrackappAnalysisLoading,
  TrackappAnalysisStatusBar,
} from "@/components/trackapp/trackapp-accueil-analysis";

import "@/styles/trackapp-accueil-analysis.css";
import "@/styles/trackapp-guest-preview.css";

export default function TrackappApercuAppLoading() {
  return (
    <TrackappAccueilAnalysisRoot appName="…">
      <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement de l'aperçu app">
        <TrackappAnalysisStatusBar />
        <div className="trackapp-guest-banner mb-4">
          <div className="trackapp-analysis-shimmer h-16 w-full rounded-xl" />
        </div>
        <section className="trackapp-analysis-block trackapp-analysis-block__scan overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-white p-6 shadow-[var(--dash-shadow-lg)]">
          <div className="flex gap-5">
            <div className="trackapp-analysis-shimmer h-28 w-28 shrink-0 rounded-[28px]" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="trackapp-analysis-shimmer h-3 w-28 rounded" />
              <div className="trackapp-analysis-shimmer h-12 w-full max-w-md rounded-xl" />
              <div className="trackapp-analysis-shimmer h-5 w-48 rounded" />
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
