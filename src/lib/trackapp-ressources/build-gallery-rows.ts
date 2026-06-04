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

export function normalizeStem(name: string): string {
  return name
    .replace(/\.[^.]+$/i, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function prettyTitleFromStem(stem: string): string {
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

export function buildGalleryRowsFromNames(
  names: readonly string[],
  bytesByName?: Readonly<Record<string, number>>,
): TrackappResourceRow[] {
  const visible = names.filter((n) => !n.startsWith(".") && n !== "Thumbs.db" && n !== "manifest.json");
  const videos = visible.filter((n) => VIDEO_RE.test(n));
  const zips = visible.filter((n) => ZIP_RE.test(n));
  const usedZips = new Set<string>();

  const orderedVideos = [...videos].sort((a, b) => normalizeStem(b).length - normalizeStem(a).length);

  const rows = orderedVideos.map((videoFile) => {
    const pool = zips.filter((z) => !usedZips.has(z));
    const zipFile = pickZipForVideo(videoFile, pool);
    if (zipFile) usedZips.add(zipFile);

    const stem = videoFile.replace(/\.[^.]+$/i, "");
    const id = Buffer.from(stem, "utf8").toString("base64url");

    return {
      id,
      title: prettyTitleFromStem(stem),
      videoFile,
      zipFile: zipFile ?? null,
      videoBytes: bytesByName?.[videoFile] ?? null,
      zipBytes: zipFile ? (bytesByName?.[zipFile] ?? null) : null,
    };
  });

  rows.sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" }));
  return rows;
}
