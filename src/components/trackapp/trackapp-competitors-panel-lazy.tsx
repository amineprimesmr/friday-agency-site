"use client";

import dynamic from "next/dynamic";

import type { CountryCode } from "@/lib/apple-charts";
import { TrackappAnalysisLoading, TrackappAnalysisSection } from "@/components/trackapp/trackapp-accueil-analysis";

const TrackappCompetitorsPanel = dynamic(
  () =>
    import("@/components/trackapp/trackapp-competitors-panel").then((m) => {
      function CompetitorsWithReveal(
        props: Readonly<{
          appId: string;
          appName: string;
          country: CountryCode;
        }>,
      ) {
        return (
          <TrackappAnalysisSection stepId="competitors">
            <m.TrackappCompetitorsPanel {...props} />
          </TrackappAnalysisSection>
        );
      }
      return CompetitorsWithReveal;
    }),
  {
    ssr: false,
    loading: () => <TrackappAnalysisLoading stepId="competitors" />,
  },
);

export function TrackappCompetitorsPanelLazy({
  appId,
  appName,
  country,
}: Readonly<{
  appId: string;
  appName: string;
  country: CountryCode;
}>) {
  return <TrackappCompetitorsPanel appId={appId} appName={appName} country={country} />;
}
