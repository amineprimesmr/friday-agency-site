"use client";

import dynamic from "next/dynamic";

import { TrackappAnalysisLoading, TrackappAnalysisSection } from "@/components/trackapp/trackapp-accueil-analysis";

const TrackappApplabSection = dynamic(
  () =>
    import("@/components/trackapp/trackapp-applab-section").then((m) => {
      function ApplabWithReveal(
        props: Readonly<{
          appId: string;
          appName: string;
          country: string;
          artworkUrl?: string | null;
          artistName?: string;
          autoOpenExport?: boolean;
        }>,
      ) {
        return (
          <TrackappAnalysisSection stepId="applab">
            <m.TrackappApplabSection {...props} />
          </TrackappAnalysisSection>
        );
      }
      return ApplabWithReveal;
    }),
  {
    ssr: false,
    loading: () => <TrackappAnalysisLoading stepId="applab" />,
  },
);

export function TrackappApplabSectionLazy(
  props: Readonly<{
    appId: string;
    appName: string;
    country: string;
    artworkUrl?: string | null;
    artistName?: string;
    autoOpenExport?: boolean;
  }>,
) {
  return <TrackappApplabSection {...props} />;
}
