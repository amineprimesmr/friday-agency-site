#!/usr/bin/env node
/**
 * Démarre Next en dev sur 127.0.0.1:3000 et ouvre le navigateur quand le port répond.
 */
import { execSync, spawn } from "node:child_process";
import { createConnection } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = 3000;
const host = "127.0.0.1";

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
  const sub = process.argv.slice(2).join(" ").trim();
  const openPath = sub || "/tracker";

  execSync(`node "${path.join(root, "scripts/free-port.mjs")}" ${port}`, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  const nextCli = path.join(root, "node_modules/next/dist/bin/next");
  const next = spawn(process.execPath, [nextCli, "dev", "--hostname", host, "-p", String(port)], {
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
