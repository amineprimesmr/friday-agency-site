#!/usr/bin/env node
/**
 * Ouvre le navigateur par défaut sur l'URL locale (macOS : `open`, sinon best-effort).
 * Usage : node scripts/open-local-dev.mjs [port] [path]
 * Ex. : node scripts/open-local-dev.mjs 3000 /tracker
 */
import { execSync } from "node:child_process";

const port = process.argv[2] ?? "3000";
const path = process.argv[3] ?? "";
const url = `http://127.0.0.1:${port}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;

const isMac = process.platform === "darwin";
try {
  if (isMac) execSync(`open "${url}"`, { stdio: "inherit" });
  else if (process.platform === "win32") execSync(`start "" "${url}"`, { shell: true, stdio: "inherit" });
  else execSync(`xdg-open "${url}"`, { stdio: "inherit" });
} catch {
  console.error(`Ouvre manuellement : ${url}`);
  process.exit(1);
}
