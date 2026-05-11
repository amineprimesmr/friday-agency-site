/**
 * Chemins publics vers les vidéos showcase (fichiers dans `/public/assets/appvideo`).
 *
 * Important déploiement Vercel : ne pas utiliser `fs.readdir` ici — Next.js file tracing
 * inclurait tout le dossier dans la serverless function de la page (limite ~300 Mo).
 * Ajouter une entrée quand tu ajoutes un fichier ; ou pointe vers des URLs externes.
 */
const APP_SHOWCASE_VIDEO_FILENAMES = [
  "kalam.mov",
  "kotcha.mov",
  "locket.mov",
  "napper.mov",
  "speak.mov",
  "watchlab.mov",
] as const;

/** Fichiers vidéo publics dans `/public/assets/appvideo`, triés par nom. */
export function listAppShowcaseVideos(): string[] {
  return [...APP_SHOWCASE_VIDEO_FILENAMES]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((f) => `/assets/appvideo/${encodeURIComponent(f)}`);
}
