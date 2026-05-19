import type { AppDetail, CountryCode } from "@/lib/apple-charts";
import type { OfficialBrandPresenceContext } from "@/lib/official-brand-presence-context";
import type { TrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";

export type TrackappCloneStack = "swiftui" | "react-native" | "expo";

export type TrackappCloneAngle = "inspire" | "niche-adjacent" | "premium-simple";

export type TrackappPreferredIde = "cursor" | "claude";

export type TrackappClonePromptInput = Readonly<{
  app: AppDetail;
  country: CountryCode;
  metrics: TrackappAppDisplayMetrics;
  screenshotUrls: readonly string[];
  presence: OfficialBrandPresenceContext | null;
  stack: TrackappCloneStack;
  angle: TrackappCloneAngle;
  trackappSpecUrl: string;
  trackappAppUrl: string;
  overallRank: number | null;
  genreRank: number | null;
}>;

export type TrackappClonePromptBundle = Readonly<{
  appId: string;
  appName: string;
  country: CountryCode;
  fullPrompt: string;
  deeplinkPrompt: string;
  markdownFilename: string;
  specUrl: string;
  appUrl: string;
  cursorDeeplink: string;
  cursorWebDeeplink: string;
  claudeDeeplink: string;
  generatedAt: string;
}>;
