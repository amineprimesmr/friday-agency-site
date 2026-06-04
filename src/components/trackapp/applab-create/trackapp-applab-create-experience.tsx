"use client";

import { TrackappApplabCreateFlow } from "@/components/trackapp/applab-create/trackapp-applab-create-flow";
import { TrackappApplabCreateShell } from "@/components/trackapp/applab-create/trackapp-applab-create-shell";
import type { AppShowcaseVideoItemEnriched } from "@/lib/showcase-app-videos-types";

export function TrackappApplabCreateExperience({
  initialName = "",
  initialConcept = "",
  showcaseVideos = [],
}: Readonly<{
  initialName?: string;
  initialConcept?: string;
  showcaseVideos?: AppShowcaseVideoItemEnriched[];
}>) {
  return (
    <TrackappApplabCreateShell>
      <TrackappApplabCreateFlow
        initialName={initialName}
        initialConcept={initialConcept}
        showcaseVideos={showcaseVideos}
      />
    </TrackappApplabCreateShell>
  );
}
