"use client";

import { Space_Grotesk } from "next/font/google";

import { TrackerLiquidGlassFilterSvg } from "@/components/tracker/tracker-liquid-glass-filter-svg";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-applab-create.css";
import "@/styles/tracker-ux.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export function TrackappApplabCreateShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={cn("ta-applab-studio ta-font", spaceGrotesk.variable)}>
      <TrackerLiquidGlassFilterSvg />
      {children}
    </div>
  );
}
