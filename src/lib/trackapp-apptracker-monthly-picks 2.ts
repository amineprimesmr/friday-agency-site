import { unstable_cache } from "next/cache";

import { fetchAppDetail, type CountryCode, type SearchResult } from "@/lib/apple-charts";
import { appDetailToSearchResultForFavorites } from "@/lib/trackapp-app-favorites-map";

/** Libellé affiché en tête de page — à mettre à jour chaque mois. */
export const TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL = "Mai 2026";

export type TrackappMonthlyPickDefinition = Readonly<{
  id: string;
  blurb: string;
}>;

/**
 * Références App Store (trackId) + angle éditorial « quoi recopier de A à Z ».
 * Mettre à jour la liste régulièrement selon l’actualité produit.
 */
export const TRACKAPP_APPTRACKER_MONTHLY_PICKS: readonly TrackappMonthlyPickDefinition[] = [
  {
    id: "835599320",
    blurb:
      "Feed infini, création UGC, boucle de rétention : l’exemple le plus complet pour une app consumer ultra addictive à étudier du bouton install au FYP.",
  },
  {
    id: "570060128",
    blurb:
      "Streaks, récompenses, monétisation par paliers : blueprint idéal pour gamifier l’habitude sans sacrifier la clarté du parcours.",
  },
  {
    id: "6448311069",
    blurb:
      "Chat comme surface principale, onboarding minimal, abonnement : à copier pour une app IA / assistant avec un modèle SaaS mobile crédible.",
  },
  {
    id: "1482384689",
    blurb:
      "Scan → verdict → partage : démonstration parfaite d’une app utilitaire quotidienne avec confiance, simplicité et forte viralité organique.",
  },
  {
    id: "426826309",
    blurb:
      "Réseau social + activité physique + freemium : à disséquer pour la communauté, les classements et la conversion vers l’abonnement.",
  },
  {
    id: "1232780281",
    blurb:
      "Workspace flexible, templates, partage : structure de référence pour une app productivité avec adoption large et usage B2C / pro.",
  },
];

export type TrackappMonthlyPickResolved = Readonly<{
  app: SearchResult;
  blurb: string;
}>;

export const getTrackappApptrackerMonthlyPicks = unstable_cache(
  async (country: CountryCode) => {
    const rows = await Promise.all(
      TRACKAPP_APPTRACKER_MONTHLY_PICKS.map(async (def, i) => {
        const detail = await fetchAppDetail(def.id, country);
        if (!detail) return null;
        return {
          app: appDetailToSearchResultForFavorites(detail, i + 1),
          blurb: def.blurb,
        } satisfies TrackappMonthlyPickResolved;
      }),
    );
    return rows.filter((x): x is TrackappMonthlyPickResolved => x != null);
  },
  ["trackapp-apptracker-monthly-picks-v1"],
  { revalidate: 3600 },
);
