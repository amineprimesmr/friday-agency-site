/**
 * Télécharge les sources uploadées pour un déploiement Vercel (API fichiers)
 * et les extrait dans un répertoire cible (sans inclure le dossier factice racine "src").
 *
 * Usage:
 *   node scripts/restore-from-vercel-deployment.mjs <deploymentId> <destDir>
 *
 * Exemple:
 *   node scripts/restore-from-vercel-deployment.mjs dpl_CiNMFF147CtfcC1M4m1RsDgnoASS /tmp/trackapp-from-vercel
 */

import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";

const AUTH = path.join(
  process.env.HOME,
  "Library/Application Support/com.vercel.cli/auth.json",
);

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "out",
  ".git",
]);

function collectFromChildren(children, prefix, acc) {
  for (const c of children || []) {
    const rel = path.join(...prefix, c.name);
    if (c.type === "file") {
      acc.push({ rel, uid: c.uid });
    } else if (c.type === "directory") {
      if (SKIP_DIRS.has(c.name)) continue;
      collectFromChildren(c.children, [...prefix, c.name], acc);
    }
  }
}

async function main() {
  const deploymentId = process.argv[2];
  const destRoot = process.argv[3];
  const teamId =
    process.env.VERCEL_TEAM_ID || "team_e0weEZMlu8M01WQhzu5MAE5j";

  if (!deploymentId || !destRoot) {
    console.error(
      "Usage: node scripts/restore-from-vercel-deployment.mjs <deploymentId> <destDir>",
    );
    process.exit(1);
  }

  const token = JSON.parse(await readFile(AUTH, "utf8")).token;

  const listUrl = `https://api.vercel.com/v6/deployments/${deploymentId}/files?teamId=${encodeURIComponent(teamId)}`;
  const res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("List files failed", res.status, await res.text());
    process.exit(1);
  }
  const tree = await res.json();

  /** Racine uploadée : nœud nommé "src" qui contient en réalité package.json, etc. */
  const fakeRoot = tree.find((n) => n.name === "src" && n.type === "directory");
  if (!fakeRoot?.children) {
    console.error("Could not find project root node 'src' in file tree");
    process.exit(1);
  }

  const files = [];
  collectFromChildren(fakeRoot.children, [], files);

  let n = 0;
  for (const { rel, uid } of files) {
    const fileUrl = `https://api.vercel.com/v8/deployments/${deploymentId}/files/${encodeURIComponent(uid)}?teamId=${encodeURIComponent(teamId)}`;
    const fr = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!fr.ok) {
      console.error("File fetch failed", rel, fr.status, await fr.text());
      process.exit(1);
    }
    const { data } = await fr.json();
    const buf = Buffer.from(data, "base64");
    const outPath = path.join(destRoot, rel);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, buf);
    n++;
    if (n % 200 === 0) console.error("…", n, "files");
  }
  console.error("Wrote", n, "files under", destRoot);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
