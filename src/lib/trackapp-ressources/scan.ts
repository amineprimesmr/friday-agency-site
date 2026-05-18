import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { resolveResourcesDir } from "@/lib/trackapp-ressources/config";

const VIDEO_RE = /\.(mp4|mov|webm|m4v)$/i;
const ZIP_RE = /\.zip$/i;

export type TrackappResourceRow = {
  id: string;
  title: string;
  videoFile: string;
  zipFile: string | null;
  videoBytes: number | null;
  zipBytes: number | null;
};

const CACHE_TTL_MS = 10_000;
let cache:
  | {
      at: number;
      baseDir: string | null;
      items: TrackappResourceRow[];
    }
  | null = null;

function normalizeStem(name: string): string {
  return name
    .replace(/\.[^.]+$/i, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function prettyTitleFromStem(stem: string): string {
  const spaced = stem
    .replace(/_/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
  return spaced || stem;
}

function pickZipForVideo(videoFile: string, pool: string[]): string | undefined {
  const vStem = normalizeStem(videoFile);
  const exact = pool.find((z) => normalizeStem(z) === vStem);
  if (exact) return exact;

  const candidates = pool.filter((z) => {
    const zs = normalizeStem(z);
    return zs.startsWith(vStem) || vStem.startsWith(zs);
  });
  if (candidates.length === 0) return undefined;

  const prefixed = candidates.filter((z) => normalizeStem(z).startsWith(vStem));
  const list = prefixed.length ? prefixed : candidates;
  list.sort((a, b) => normalizeStem(a).length - normalizeStem(b).length);
  return list[0];
}

async function fileSize(fullPath: string): Promise<number | null> {
  try {
    const s = await stat(fullPath);
    return s.isFile() ? s.size : null;
  } catch {
    return null;
  }
}

export async function scanTrackappResources(): Promise<{
  baseDir: string | null;
  items: TrackappResourceRow[];
}> {
  const baseDir = resolveResourcesDir();
  if (!baseDir) return { baseDir: null, items: [] };

  const now = Date.now();
  if (cache && cache.baseDir === baseDir && now - cache.at < CACHE_TTL_MS) {
    return { baseDir: cache.baseDir, items: cache.items };
  }

  let names: string[];
  try {
    names = await readdir(baseDir);
  } catch {
    return { baseDir, items: [] };
  }

  const visible = names.filter((n) => !n.startsWith(".") && n !== "Thumbs.db");

  const videos = visible.filter((n) => VIDEO_RE.test(n)).sort((a, b) => a.localeCompare(b, "fr"));
  const zips = visible.filter((n) => ZIP_RE.test(n));

  const usedZips = new Set<string>();

  const orderedVideos = [...videos].sort((a, b) => normalizeStem(b).length - normalizeStem(a).length);

  const rowInputs = orderedVideos.map((videoFile) => {
    const pool = zips.filter((z) => !usedZips.has(z));
    const zipFile = pickZipForVideo(videoFile, pool);
    if (zipFile) usedZips.add(zipFile);

    const stem = videoFile.replace(/\.[^.]+$/i, "");
    const id = Buffer.from(stem, "utf8").toString("base64url");

    const videoPath = path.join(baseDir, videoFile);
    const zipPath = zipFile ? path.join(baseDir, zipFile) : null;

    return { videoFile, zipFile, stem, id, videoPath, zipPath };
  });

  const rows = await Promise.all(
    rowInputs.map(async ({ videoFile, zipFile, stem, id, videoPath, zipPath }) => ({
      id,
      title: prettyTitleFromStem(stem),
      videoFile,
      zipFile: zipFile ?? null,
      videoBytes: await fileSize(videoPath),
      zipBytes: zipPath ? await fileSize(zipPath) : null,
    })),
  );

  rows.sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" }));

  cache = { at: now, baseDir, items: rows };

  return { baseDir, items: rows };
}
