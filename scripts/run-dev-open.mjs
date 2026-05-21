#!/usr/bin/env node
/**
 * Démarre Next en dev et ouvre le navigateur quand le port répond.
 * Usage : node scripts/run-dev-open.mjs [port] [chemin]
 * Ex. : node scripts/run-dev-open.mjs 3002 /trackapp/accueil
 */
import { execSync, spawn } from "node:child_process";
import { createConnection } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const host = "127.0.0.1";

function normalizeOpenPath(raw) {
  const sub = (raw ?? "").trim();
  if (!sub) return "/tracker";
  return sub.startsWith("/") ? sub : `/${sub}`;
}

function resolveCli() {
  const args = process.argv.slice(2);
  if (args[0] && /^\d{2,5}$/.test(args[0])) {
    return { port: Number(args[0]), openPath: normalizeOpenPath(args[1]) };
  }
  const envPort = process.env.TRACKAPP_DEV_PORT?.trim();
  if (envPort && /^\d{2,5}$/.test(envPort)) {
    return { port: Number(envPort), openPath: normalizeOpenPath(args[0]) };
  }
  return { port: 3000, openPath: normalizeOpenPath(args[0]) };
}

const { port, openPath } = resolveCli();

function waitForPort(msTotal = 120000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const s = createConnection({ port, host }, () => {
        s.end();
        resolve(true);
      });
      s.on("error", () => {
        if (Date.now() - started > msTotal) {
          reject(new Error(`Timeout : aucun serveur sur http://${host}:${port} après ${msTotal / 1000}s.`));
        } else {
          setTimeout(attempt, 350);
        }
      });
    };
    attempt();
  });
}

function main() {
  execSync(`node "${path.join(root, "scripts/free-port.mjs")}" ${port}`, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  const launcher = path.join(root, "scripts/launch-next-dev.mjs");
  const next = spawn(process.execPath, [launcher, "--turbo", "-p", String(port)], {
    cwd: root,
    stdio: ["inherit", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  next.stdout?.on("data", (d) => process.stdout.write(d));
  next.stderr?.on("data", (d) => process.stderr.write(d));

  next.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  waitForPort(120000)
    .then(() => {
      spawn(
        process.execPath,
        [path.join(root, "scripts/open-local-dev.mjs"), String(port), openPath],
        { cwd: root, stdio: "inherit", detached: true },
      ).unref();
      console.log(`\n→ http://${host}:${port}${openPath.startsWith("/") ? openPath : `/${openPath}`}\n`);
    })
    .catch((e) => {
      console.error(e instanceof Error ? e.message : e);
      next.kill("SIGTERM");
      process.exit(1);
    });

  void new Promise(() => {});
}

main();
