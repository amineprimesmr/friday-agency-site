/**
 * Chemins publics vers les vidéos showcase (fichiers dans `/public/assets/appvideo`).
 *
 * Important déploiement Vercel : ne pas utiliser `fs.readdir` ici — Next.js file tracing
 * inclurait tout le dossier dans la serverless function de la page (limite ~300 Mo).
 * Ajouter une entrée quand tu ajoutes un fichier ; ou pointe vers des URLs externes.
 *
 * --- CA mensuel ---
 * Avec `appStoreId`, le CA affiché sur la home vient de Sensor Tower comme sur `/tracker/apps/[id]`
 * (`listAppShowcaseVideoItemsEnriched`). Sinon repli sur `approxMonthlyRevenueEUR` + `deriveShowcaseMonthlyRevenueEUR`.
 */

export type AppShowcaseVideoItem = {
  /** URL publique `/assets/appvideo/...` — sert aussi de clé stable pour la dérivation du CA affiché. */
  src: string;
  /** Image légère affichée immédiatement pendant que la vidéo se met en cache. */
  posterSrc: string;
  displayName: string;
  artworkUrl: string;
  /** ID App Store — CA affiché via Sensor Tower (`fetchIosAggregateAppMetrics`), comme les fiches app. */
  appStoreId: string;
  /** Fallback si l’agrégat ST est indisponible — dérivé dans `showcase-revenue-display`. */
  approxMonthlyRevenueEUR: number;
};

const APP_SHOWCASE_VIDEO_ROWS = [
  {
    file: "kalam.mp4",
    displayName: "Kalam",
    appStoreId: "6745237476",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b7/aa/f4/b7aaf4b2-713c-c7c9-0128-dba0f82cf4a2/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 49_000,
  },
  {
    file: "kotcha.mp4",
    displayName: "Kotcha",
    appStoreId: "6746164787",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ac/e3/c8/ace3c864-fc16-ae7d-e670-6c55b629ff99/AppIcon-0-1x_U007ephone-0-1-85-220-0.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 32_000,
  },
  {
    file: "locket.mp4",
    displayName: "Locket",
    appStoreId: "1600525061",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8d/f6/d4/8df6d4b9-e743-707c-0035-77893ba2c322/app_icon-0-0-1x_U007ephone-0-1-sRGB-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 95_000,
  },
  {
    file: "napper.mp4",
    displayName: "Napper",
    appStoreId: "1491340863",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8b/3d/5c/8b3d5c5b-f501-2528-741f-869cd02f80c0/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 27_000,
  },
  {
    file: "speak.mp4",
    displayName: "Speak",
    appStoreId: "1286609883",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ef/62/9e/ef629ebe-4fc6-251d-c2af-c3be692bbf73/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 57_000,
  },
  {
    file: "watchlab.mp4",
    displayName: "Watchlab",
    appStoreId: "6446290569",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/13/1c/58/131c583b-24dd-e945-0919-d24105f46a26/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
    approxMonthlyRevenueEUR: 39_000,
  },
] as const satisfies ReadonlyArray<{
  file: string;
  displayName: string;
  appStoreId: string;
  artworkUrl: string;
  approxMonthlyRevenueEUR: number;
}>;

/** Métadonnées + URL, triées par nom de fichier (aligné sur l’ancien tri). */
export function listAppShowcaseVideoItems(): AppShowcaseVideoItem[] {
  return [...APP_SHOWCASE_VIDEO_ROWS]
    .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" }))
    .map((row) => ({
      src: `/assets/appvideo/${encodeURIComponent(row.file)}`,
      posterSrc: `/assets/appvideo/${encodeURIComponent(row.file.replace(/\.mp4$/i, ".jpg"))}`,
      displayName: row.displayName,
      appStoreId: row.appStoreId,
      artworkUrl: row.artworkUrl,
      approxMonthlyRevenueEUR: row.approxMonthlyRevenueEUR,
    }));
}

/** @deprecated Préférer `listAppShowcaseVideoItems` pour les métadonnées. */
export function listAppShowcaseVideos(): string[] {
  return listAppShowcaseVideoItems().map((v) => v.src);
}
