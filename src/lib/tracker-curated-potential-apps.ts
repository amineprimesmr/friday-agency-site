import type { MultiCountryApp } from "@/lib/apple-charts";
import {
  fetchIosAggregateAppMetrics,
  formatEstimatedMonthlyRevenuePrecise,
  TRACKER_DEFAULT_COUNTRY,
} from "@/lib/apple-charts";

/**
 * Sélection éditoriale storefront France sur le dashboard Tracker.
 * CA affiché : même pipeline que les fiches app (`fetchIosAggregateAppMetrics`), sinon estimation précise.
 */
const ROWS = [
  {
    id: "6739003582",
    label: "Blow Up",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a8/ff/a1/a8ffa196-fce9-85a6-89fd-e59a807d82f1/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    estimateRank: 68,
    categoryId: "6008",
  },
  {
    id: "6456176249",
    label: "Bevel",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b0/bc/ec/b0bcec19-83e6-61ac-9ac4-2df647217478/AppIconFlatAuto-0-0-1x_U007ephone-0-0-0-1-0-0-P3-85-220.png/512x512bb.jpg",
    estimateRank: 74,
    categoryId: "6008",
  },
  {
    id: "6648771147",
    label: "FocusFlight",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a0/8b/c1/a08bc118-a1b5-934a-f4fb-08bcbb5c8040/AppIcon-0-1x_U007epad-0-1-0-sRGB-85-220-0.png/512x512bb.jpg",
    estimateRank: 46,
    categoryId: "6007",
  },
  {
    id: "6478868302",
    label: "AI Video",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/67/68/da/6768dacc-ad69-0b6c-c2a8-26c3e6e22225/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/512x512bb.jpg",
    estimateRank: 58,
    categoryId: "6008",
  },
  {
    id: "320606217",
    label: "Sleep Cycle",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e0/db/cd/e0dbcd04-e9f0-85b0-2299-2da1a04ecac5/AppIconSleepCycle-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
    estimateRank: 22,
    categoryId: "6013",
  },
  {
    id: "6746838126",
    label: "Depuff AI",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5e/30/57/5e3057ba-bb10-472d-26eb-ebbd8b212a5f/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/512x512bb.jpg",
    estimateRank: 118,
    categoryId: "6013",
  },
  {
    id: "1551099110",
    label: "FaceYogi",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/54/0d/cf/540dcfa1-7cd4-d880-56e4-6dbdd9ac60d5/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    estimateRank: 84,
    categoryId: "6013",
  },
  {
    id: "1286609883",
    label: "Speak",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ef/62/9e/ef629ebe-4fc6-251d-c2af-c3be692bbf73/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    estimateRank: 38,
    categoryId: "6017",
  },
  {
    id: "946099227",
    label: "Yazio",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/dc/56/57/dc5657b5-2c4a-668d-c3d7-75b077328d23/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    estimateRank: 51,
    categoryId: "6023",
  },
  {
    id: "1660982988",
    label: "YouCan",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f5/1b/f1/f51bf154-c601-91ab-131b-dbfa2fee85b3/AppIcon-0-0-1x_U007emarketing-0-8-0-sRGB-85-220.png/512x512bb.jpg",
    estimateRank: 96,
    categoryId: "6012",
  },
  {
    id: "6444187351",
    label: "Punkt AI",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fe/4b/4a/fe4b4af4-f69c-2ffa-cb37-620421e09c7a/AppIcon-1x_U007ephone-0-1-0-85-220-0.jpeg/512x512bb.jpg",
    estimateRank: 108,
    categoryId: "6007",
  },
  {
    id: "1481804500",
    label: "Breathwrk",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c7/8c/d6/c78cd678-d058-0ca6-3908-44baeae83287/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    estimateRank: 72,
    categoryId: "6013",
  },
  {
    id: "6478942469",
    label: "Life Reset",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/71/88/49/71884915-a0f9-d209-419d-ba500bad3699/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    estimateRank: 124,
    categoryId: "6012",
  },
  {
    id: "1510911574",
    label: "Shadow Boxing",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/bd/6c/b0/bd6cb068-dec0-d9dc-76c7-e0cc430bf3f0/icon26-0-0-1x_U007epad-0-1-sRGB-85-220.png/512x512bb.jpg",
    estimateRank: 92,
    categoryId: "6013",
  },
] as const;

function stubMultiCountry(row: (typeof ROWS)[number]): MultiCountryApp {
  return {
    id: row.id,
    name: row.label,
    artworkUrl: row.artworkUrl,
    artistName: "",
    category: "",
    categoryId: row.categoryId,
    url: `https://apps.apple.com/fr/app/id${row.id}`,
    releaseDate: "",
    rank: 0,
    country: "fr",
    flag: "🇫🇷",
  };
}

export type TrackerCuratedPotentialTile = MultiCountryApp & {
  /** USD précis (ST ou `formatEstimatedMonthlyRevenuePrecise`), comme les fiches app. */
  monthlyRevenueHint: string;
};

export async function getTrackerCuratedPotentialApps(): Promise<TrackerCuratedPotentialTile[]> {
  return Promise.all(
    ROWS.map(async (row) => {
      const base = stubMultiCountry(row);
      const agg = await fetchIosAggregateAppMetrics(row.id);
      const monthlyRevenueHint =
        agg && agg.revenue > 0 && agg.revenueString !== "—"
          ? `${agg.revenueString} / mois`
          : `${formatEstimatedMonthlyRevenuePrecise(row.estimateRank, 0, row.categoryId, TRACKER_DEFAULT_COUNTRY, row.id)} / mois`;
      return {
        ...base,
        monthlyRevenueHint,
      };
    }),
  );
}
