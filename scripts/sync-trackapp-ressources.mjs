#!/usr/bin/env node
/**
 * Copie Ressources/ → public/trackapp-ressources/ pour servir ZIP/vidéos en prod
 * + génère gallery-items.generated.json (Vercel ne peut pas lire public/ via fs).
 */
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sources = [
  path.join(root, "Ressources"),
  path.join(root, "ressources"),
];
const dest = path.join(root, "public/trackapp-ressources");
const galleryOut = path.join(root, "src/lib/trackapp-ressources/gallery-items.generated.json");

const MEDIA_RE = /\.(mp4|mov|webm|m4v|zip)$/i;
const VIDEO_RE = /\.(mp4|mov|webm|m4v)$/i;
const ZIP_RE = /\.zip$/i;

function normalizeStem(name) {
  return name
    .replace(/\.[^.]+$/i, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function prettyTitleFromStem(stem) {
  const spaced = stem
    .replace(/_/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
  return spaced || stem;
}

function pickZipForVideo(videoFile, pool) {
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

function buildGalleryRows(files) {
  const names = files.map((f) => f.name);
  const bytesByName = Object.fromEntries(files.map((f) => [f.name, f.bytes]));
  const visible = names.filter((n) => !n.startsWith(".") && n !== "Thumbs.db" && n !== "manifest.json");
  const videos = visible.filter((n) => VIDEO_RE.test(n));
  const zips = visible.filter((n) => ZIP_RE.test(n));
  const usedZips = new Set();

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
      videoBytes: bytesByName[videoFile] ?? null,
      zipBytes: zipFile ? (bytesByName[zipFile] ?? null) : null,
    };
  });

  rows.sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" }));
  return rows;
}

async function resolveSourceDir() {
  for (const dir of sources) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) return dir;
    } catch {
      /* next */
    }
  }
  return null;
}

async function writeEmptyGallery() {
  const manifest = {
    version: 1,
    updatedAt: new Date().toISOString(),
    configured: false,
    basePath: "/trackapp-ressources",
    resources: [],
  };
  await writeFile(path.join(dest, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(
    galleryOut,
    `${JSON.stringify({ configured: false, basePath: "/trackapp-ressources", items: [] }, null, 2)}\n`,
  );
}

async function main() {
  const sourceDir = await resolveSourceDir();
  await mkdir(dest, { recursive: true });

  if (!sourceDir) {
    console.warn("[sync-trackapp-ressources] Aucun dossier Ressources/ — skip copie.");
    await writeEmptyGallery();
    return;
  }

  const names = (await readdir(sourceDir)).filter(
    (n) => !n.startsWith(".") && MEDIA_RE.test(n),
  );

  let copied = 0;
  const files = [];

  for (const name of names) {
    const src = path.join(sourceDir, name);
    const dst = path.join(dest, name);
    try {
      const s = await stat(src);
      if (!s.isFile()) continue;
      await copyFile(src, dst);
      copied += 1;
      files.push({ name, bytes: s.size, ext: path.extname(name).toLowerCase() });
    } catch (err) {
      console.warn(`[sync-trackapp-ressources] Skip ${name}:`, err.message);
    }
  }

  files.sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const galleryItems = buildGalleryRows(files);

  const manifest = {
    version: 1,
    updatedAt: new Date().toISOString(),
    configured: true,
    sourceDir: path.basename(sourceDir),
    basePath: "/trackapp-ressources",
    fileCount: files.length,
    galleryCount: galleryItems.length,
    resources: files.map((f) => ({
      filename: f.name,
      bytes: f.bytes,
      kind: f.ext === ".zip" ? "zip" : "video",
      url: `/trackapp-ressources/${encodeURIComponent(f.name)}`,
    })),
    aiInstructions: {
      summary:
        "Télécharge les ZIP listés dans TRACKAPP_RESOURCES.md via curl/wget depuis ces URLs publiques.",
      manifestUrl: "/trackapp-ressources/manifest.json",
      integrationFolder: "ThirdPartyUI/Trackapp/",
    },
  };

  await writeFile(path.join(dest, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(
    galleryOut,
    `${JSON.stringify(
      {
        configured: true,
        basePath: "/trackapp-ressources",
        updatedAt: manifest.updatedAt,
        items: galleryItems,
      },
      null,
      2,
    )}\n`,
  );

  const zipBytes = files.filter((f) => f.ext === ".zip").reduce((n, f) => n + f.bytes, 0);
  console.log(
    `[sync-trackapp-ressources] ${copied} fichiers → public/trackapp-ressources (${Math.round(zipBytes / 1024 / 1024)} Mo ZIP) · ${galleryItems.length} entrées galerie`,
  );
}

main().catch((err) => {
  console.error("[sync-trackapp-ressources] Échec:", err);
  process.exit(1);
});
