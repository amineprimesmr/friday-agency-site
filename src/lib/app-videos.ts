import fs from "node:fs";
import path from "node:path";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

/** Fichiers vidéo publics dans `/public/assets/appvideo`, triés par nom. */
export function listAppShowcaseVideos(): string[] {
  const dir = path.join(process.cwd(), "public", "assets", "appvideo");
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => VIDEO_EXT.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((f) => `/assets/appvideo/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}
