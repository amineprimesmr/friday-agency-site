export type AppShowcaseVideoItem = {
  src: string;
  posterSrc: string;
  /** Icône locale (fallback fiable si artwork iTunes indisponible). */
  iconSrc: string;
  displayName: string;
  artworkUrl: string;
  appStoreId: string;
  approxMonthlyRevenueEUR: number;
};

export type HeroRotatorAppRef = {
  id: string;
  name: string;
  artworkUrl: string;
  iconSrc: string;
};

export type SelectionAppEntry = Readonly<{
  slug: string;
  displayName: string;
  appStoreId: string;
  videoFile: string;
  posterFile?: string;
  artworkUrl?: string;
  approxMonthlyRevenueEUR?: number;
  /** Ordre d’affichage dans la galerie (plus petit = plus haut). */
  sortOrder: number;
  /** Inclure dans le rotator d’icônes du hero AppLAB. */
  heroRotator?: boolean;
}>;
