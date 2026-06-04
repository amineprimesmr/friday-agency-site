/** Plateformes supportées par les indices manuels Trackapp (seeds, pas override absolu). */
export type OfficialSocialOverridePlatform =
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "threads";

export const OFFICIAL_SOCIAL_OVERRIDE_PLATFORMS: readonly OfficialSocialOverridePlatform[] = [
  "instagram",
  "tiktok",
  "x",
  "youtube",
  "facebook",
  "linkedin",
  "threads",
];

/**
 * Indices manuels quand le site est une SPA ou qu’OpenAI rate.
 * Concurrencent le scrape site + OpenAI — ne bloquent plus les meilleures sources.
 */
export const VERIFIED_OFFICIAL_SOCIAL_OVERRIDES: Readonly<
  Record<string, Partial<Readonly<Record<OfficialSocialOverridePlatform, string>>>>
> = {
  "6478868302": {
    tiktok: "https://www.tiktok.com/@aivideoapp",
    instagram: "https://www.instagram.com/appaivideo/",
  },
  "570060128": {
    instagram: "https://www.instagram.com/duolingo/",
    tiktok: "https://www.tiktok.com/@duolingo",
    facebook: "https://www.facebook.com/duolingo",
    x: "https://x.com/duolingo",
    youtube: "https://www.youtube.com/@duolingo",
    linkedin: "https://www.linkedin.com/company/duolingo",
  },
};
