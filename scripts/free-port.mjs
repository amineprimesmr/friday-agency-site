#!/usr/bin/env node
/**
 * Libère le port avant `next dev` : si un ancien Node occupe encore le port,
 * le navigateur peut afficher une page noire « Internal Server Error » au lieu du bon bundle.
 *
 * Usage : node scripts/free-port.mjs [port]
 */
import { execSync } from "node:child_process";

const port = process.argv[2] ?? process.env.PORT ?? "3000";

try {
  const out = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
  if (!out) process.exit(0);
  const pids = out
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGKILL");
      console.warn(`[free-port] port ${port} → kill PID ${pid}`);
    } catch {
      //
    }
  }
} catch {
  /* aucun PID sur ce port */
}
