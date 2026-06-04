import type { SelectionAppEntry } from "@/lib/selection-app/types";

/** Dossier public unique — déposer vidéo + poster ici, puis ajouter une entrée ci-dessous. */
export const SELECTION_APP_PUBLIC_DIR = "/selection-app";

/**
 * Catalogue de la sélection d’apps Trackapp.
 * Pour ajouter une app : copier `{slug}.mp4` (+ `{slug}.jpg` optionnel) dans `public/selection-app/`,
 * puis compléter cette liste.
 */
export const SELECTION_APP_CATALOG: readonly SelectionAppEntry[] = [
  {
    slug: "bevel",
    displayName: "Bevel",
    appStoreId: "6456176249",
    videoFile: "bevel.mp4",
    posterFile: "bevel.jpg",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/3a/37/d0/3a37d0ab-725d-8c03-d3f0-b8ae976e92c5/AppIconFlatAuto-0-0-1x_U007ephone-0-0-0-1-0-0-P3-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 95_000,
    sortOrder: 10,
    heroRotator: true,
  },
  {
    slug: "opal",
    displayName: "Opal",
    appStoreId: "1497465230",
    videoFile: "opal.mp4",
    posterFile: "opal.jpg",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ae/76/9e/ae769ec7-1590-4572-c7d0-a6089bcf6ef5/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 48_000,
    sortOrder: 20,
    heroRotator: true,
  },
  {
    slug: "focusflight",
    displayName: "Focus Flight",
    appStoreId: "6648771147",
    videoFile: "focusflight.mp4",
    posterFile: "focusflight.jpg",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a0/8b/c1/a08bc118-a1b5-934a-4fb5-08bcbb5c8040/AppIcon-0-1x_U007epad-0-1-0-sRGB-85-220-0.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 26_000,
    sortOrder: 30,
    heroRotator: true,
  },
  {
    slug: "duolingo",
    displayName: "Duolingo",
    appStoreId: "570060128",
    videoFile: "duolingo.mp4",
    posterFile: "duolingo.jpg",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/38/8e/17/388e17ec-abb6-ebde-a4fc-3b25839333d8/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 210_000,
    sortOrder: 40,
    heroRotator: true,
  },
  {
    slug: "yazio",
    displayName: "Yazio",
    appStoreId: "946099227",
    videoFile: "yazio.mp4",
    posterFile: "yazio.jpg",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ec/55/8e/ec558ef3-bc54-0703-8487-a502ec28c1dd/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220-0.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 82_000,
    sortOrder: 50,
  },
  {
    slug: "locket",
    displayName: "Locket",
    appStoreId: "884751070",
    videoFile: "locket.mp4",
    posterFile: "locket.jpg",
    artworkUrl: "/selection-app/locket.jpg",
    approxMonthlyRevenueEUR: 120_000,
    sortOrder: 60,
  },
  {
    slug: "napper",
    displayName: "Napper",
    appStoreId: "1491340863",
    videoFile: "napper.mp4",
    posterFile: "napper.jpg",
    artworkUrl: "/selection-app/napper.jpg",
    sortOrder: 70,
  },
  {
    slug: "speak",
    displayName: "Speak",
    appStoreId: "1286609883",
    videoFile: "speak.mp4",
    posterFile: "speak.jpg",
    artworkUrl: "/selection-app/speak.jpg",
    sortOrder: 80,
  },
  {
    slug: "watchlab",
    displayName: "Watchlab",
    appStoreId: "6446290569",
    videoFile: "watchlab.mp4",
    posterFile: "watchlab.jpg",
    artworkUrl: "/selection-app/watchlab.jpg",
    sortOrder: 90,
  },
  {
    slug: "kalam",
    displayName: "Kalam",
    appStoreId: "6745237476",
    videoFile: "kalam.mp4",
    posterFile: "kalam.jpg",
    artworkUrl: "/selection-app/kalam.jpg",
    sortOrder: 100,
  },
  {
    slug: "kotcha",
    displayName: "Kotcha",
    appStoreId: "6746164787",
    videoFile: "kotcha.mp4",
    posterFile: "kotcha.jpg",
    artworkUrl: "/selection-app/kotcha.jpg",
    sortOrder: 110,
  },
  {
    slug: "appblock",
    displayName: "AppBlock",
    appStoreId: "1515753232",
    videoFile: "appblock.mp4",
    sortOrder: 120,
  },
  {
    slug: "fatsecret",
    displayName: "FatSecret",
    appStoreId: "347184248",
    videoFile: "fatsecret.mov",
    sortOrder: 130,
  },
  {
    slug: "life-reset",
    displayName: "Life Reset",
    appStoreId: "6478942469",
    videoFile: "life-reset.mp4",
    sortOrder: 140,
  },
  {
    slug: "liven",
    displayName: "Liven",
    appStoreId: "6450840109",
    videoFile: "liven.mp4",
    sortOrder: 150,
  },
  {
    slug: "motra",
    displayName: "Motra",
    appStoreId: "1548577496",
    videoFile: "motra.mp4",
    sortOrder: 160,
  },
  {
    slug: "sleep-cycle",
    displayName: "Sleep Cycle",
    appStoreId: "320606217",
    videoFile: "sleep-cycle.mp4",
    sortOrder: 170,
  },
];

export const HERO_ROTATOR_APP_STORE_IDS = SELECTION_APP_CATALOG.filter((entry) => entry.heroRotator).map(
  (entry) => entry.appStoreId,
);
