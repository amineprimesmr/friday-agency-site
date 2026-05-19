/**
 * Liens sociaux vérifiés manuellement (App Store ID → URL).
 * Utilisés uniquement si la découverte automatique n'a rien validé.
 */
export const VERIFIED_OFFICIAL_SOCIAL_OVERRIDES: Readonly<
  Record<string, Partial<Readonly<Record<"instagram" | "tiktok", string>>>>
> = {
  "6478868302": {
    tiktok: "https://www.tiktok.com/@aivideoapp",
    instagram: "https://www.instagram.com/appaivideo/",
  },
};
