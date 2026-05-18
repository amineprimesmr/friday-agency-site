"use client";

import { TrendtrackAffiliateLanding } from "@/components/tracker/trendtrack-affiliate-landing";
import { TrackappAffiliateDashboard } from "@/components/trackapp/trackapp-affiliate-dashboard";

import "@/styles/trendtrack-affiliate.css";
import "@/styles/tracker-bracket-badge.css";
import "@/styles/trackapp-gagner-240-page.css";
import "@/styles/trackapp-affiliate-dashboard.css";

type Props = Readonly<{
  showDashboard?: boolean;
}>;

export function TrackappGagner240Page({ showDashboard = false }: Props) {
  return (
    <div className="trackapp-gagner-240-page">
      {showDashboard ? <TrackappAffiliateDashboard /> : null}
      <TrendtrackAffiliateLanding embedded={showDashboard} />
    </div>
  );
}
