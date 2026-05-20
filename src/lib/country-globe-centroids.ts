import type { CountryCode } from "@/lib/apple-charts";

/** Centroïdes approximatifs [lat, lng] pour marqueurs globe (cobe). */
export const COUNTRY_GLOBE_CENTROIDS: Record<CountryCode, readonly [number, number]> = {
  fr: [46.23, 2.21],
  gb: [55.38, -3.44],
  de: [51.17, 10.45],
  jp: [36.2, 138.25],
  br: [-14.24, -53.18],
  ca: [56.13, -106.35],
  au: [-25.27, 133.78],
  it: [41.87, 12.57],
  es: [40.46, -3.75],
  mx: [23.63, -102.55],
  in: [20.59, 78.96],
  kr: [35.91, 127.77],
  cn: [35.86, 104.2],
};
