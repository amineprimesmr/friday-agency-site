import { unstable_cache } from "next/cache";

import { searchApps, type CountryCode } from "@/lib/apple-charts";

export const TRACKAPP_APPTRACKER_SEARCH_EXAMPLES = [
  "TikTok",
  "Duolingo",
  "Cal AI",
  "BeReal",
  "ChatGPT",
  "Yuka",
] as const;

export const cachedTrackappApptrackerSearch = unstable_cache(
  async (q: string, country: CountryCode) => searchApps(q, country, 24),
  ["trackapp-apptracker-search-v1"],
  { revalidate: 300 },
);
