#!/usr/bin/env node
/**
 * Déploie en production sur Vercel après la dernière modification des fichiers suivis,
 * avec debounce (évite un déploiement par touche au clavier).
 *
 * Usage : npm run deploy:watch
 * Debounce : DEPLOY_WATCH_DEBOUNCE_MS (défaut 45000)
 */

import chokidar from "chokidar";
import { spawnSync } from "node:child_process";
import process from "node:process";

const DEBOUNCE_MS = Number(process.env.DEPLOY_WATCH_DEBOUNCE_MS ?? 45000);
const paths = [
  "src",
  "public",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "vercel.json",
  "tsconfig.json",
];

let timer = null;

function fire() {
  console.log("\n[deploy:watch] Running npm run deploy:prod …\n");
  const r = spawnSync("npm", ["run", "deploy:prod"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.error("[deploy:watch] deploy:prod exited with", r.status);
  }
}

function schedule() {
  if (timer) clearTimeout(timer);
  const s = Math.round(DEBOUNCE_MS / 1000);
  console.log(`[deploy:watch] Changement détecté — déploiement dans ~${s}s si rien d’autre ne change.`);
  timer = setTimeout(fire, DEBOUNCE_MS);
}

chokidar
  .watch(paths, {
    ignoreInitial: true,
    ignored: [/node_modules/, /\.next\//],
  })
  .on("all", () => {
    schedule();
  });

console.log(
  `[deploy:watch] Surveillance : ${paths.join(", ")} — debounce ${DEBOUNCE_MS}ms — Ctrl+C pour arrêter.`,
);
