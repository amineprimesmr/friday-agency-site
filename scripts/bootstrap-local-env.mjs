#!/usr/bin/env node
/**
 * Prépare .env.local pour le dev local : URL app, bypass premium, nettoie les clés vides Vercel.
 * Les clés Supabase doivent être collées manuellement (dashboard Supabase → API).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envLocalPath = path.join(root, ".env.local");
const envExamplePath = path.join(root, ".env.example");
const linkedRefPath = path.join(root, "supabase", ".temp", "project-ref");

function trySyncSupabaseFromCli() {
  /** @type {{ url?: string; anon?: string; service?: string }} */
  const out = {};
  let ref = "";
  try {
    if (fs.existsSync(linkedRefPath)) {
      ref = fs.readFileSync(linkedRefPath, "utf8").trim();
    }
  } catch {
    return out;
  }
  if (!ref) return out;

  try {
    const { execSync } = require("node:child_process");
    const raw = execSync(`supabase projects api-keys --project-ref ${ref}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    for (const line of raw.split("\n")) {
      const anon = line.match(/^\s*anon\s*\|\s*(.+)$/);
      if (anon) out.anon = anon[1].trim();
      const service = line.match(/^\s*service_role\s*\|\s*(.+)$/);
      if (service) out.service = service[1].trim();
    }
    out.url = `https://${ref}.supabase.co`;
  } catch {
    return {};
  }
  return out;
}

function parseEnvFile(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

function isEmptyValue(value) {
  if (value === undefined) return true;
  const v = value.trim().replace(/^["']|["']$/g, "");
  return v.length < 4;
}

function serializeEnv(env, preservedComments) {
  const lines = [
    "# ── Généré / complété par npm run setup:local ──",
    "# Supabase : Project Settings → API → URL + anon public key",
    "",
  ];

  const order = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUBSCRIPTION_SECRET",
    "TRACKAPP_DEV_UNLOCK",
    "NEXT_PUBLIC_TRACKAPP_DEV_UNLOCK",
    "OPENAI_API_KEY",
    "APIFY_TOKEN",
    "APIFY_INSTAGRAM_ACTOR_ID",
    "APIFY_TIKTOK_ACTOR_ID",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID_MONTHLY",
    "STRIPE_PRICE_ID_LIFETIME",
    "STRIPE_PRICE_ID_TRACKAPP",
  ];

  const written = new Set();
  for (const key of order) {
    if (!(key in env)) continue;
    lines.push(`${key}=${env[key]}`);
    written.add(key);
  }

  const rest = Object.keys(env)
    .filter((k) => !written.has(k))
    .filter((k) => !k.startsWith("VERCEL_GIT_"))
    .filter((k) => k !== "VERCEL_OIDC_TOKEN")
    .sort();

  if (rest.length) {
    lines.push("", "# ── Autres variables ──");
    for (const key of rest) {
      if (!isEmptyValue(env[key])) lines.push(`${key}=${env[key]}`);
    }
  }

  if (preservedComments.length) {
    lines.push("", "# ── Notes ──");
    lines.push(...preservedComments);
  }

  return `${lines.join("\n")}\n`;
}

const defaults = {
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  SUBSCRIPTION_SECRET: "local-dev-subscription-secret-change-me",
  TRACKAPP_DEV_UNLOCK: "1",
  NEXT_PUBLIC_TRACKAPP_DEV_UNLOCK: "1",
};

const example = fs.existsSync(envExamplePath) ? parseEnvFile(fs.readFileSync(envExamplePath, "utf8")) : {};
const existing = fs.existsSync(envLocalPath) ? parseEnvFile(fs.readFileSync(envLocalPath, "utf8")) : {};

/** @type {Record<string, string>} */
const merged = { ...example, ...existing };

for (const [key, value] of Object.entries(defaults)) {
  if (isEmptyValue(merged[key])) merged[key] = value;
}

const supabaseCli = trySyncSupabaseFromCli();
if (supabaseCli.url) {
  if (isEmptyValue(merged.NEXT_PUBLIC_SUPABASE_URL)) merged.NEXT_PUBLIC_SUPABASE_URL = supabaseCli.url;
}
if (supabaseCli.anon && isEmptyValue(merged.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  merged.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseCli.anon;
}
if (supabaseCli.service && isEmptyValue(merged.SUPABASE_SERVICE_ROLE_KEY)) {
  merged.SUPABASE_SERVICE_ROLE_KEY = supabaseCli.service;
}

for (const key of Object.keys(merged)) {
  if (isEmptyValue(merged[key])) delete merged[key];
}

const supabaseOk =
  !isEmptyValue(merged.NEXT_PUBLIC_SUPABASE_URL) && !isEmptyValue(merged.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const notes = [
  "# Connexion Google/email : renseigner NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "# Puis : npm run dev:reset",
];

fs.writeFileSync(envLocalPath, serializeEnv(merged, supabaseOk ? [] : notes), "utf8");

console.log("\n✓ .env.local mis à jour pour le dev local\n");
console.log("  NEXT_PUBLIC_APP_URL      →", merged.NEXT_PUBLIC_APP_URL);
console.log("  TRACKAPP_DEV_UNLOCK      → actif (SaaS sans abo en local)");
console.log(
  "  Supabase                 →",
  supabaseOk ? "configuré" : "MANQUANT (landing OK, connexion bloquée)",
);

if (!supabaseOk) {
  console.log("\n  1. supabase login && supabase link --project-ref <ref> --yes");
  console.log("  2. Relance npm run setup:local (remplit .env.local via la CLI)");
  console.log("  3. Redirect URL auth : http://127.0.0.1:3000/trackapp/auth/callback");
  console.log("  4. npm run dev:reset\n");
} else {
  console.log("\n  Lance : npm run dev:open\n");
}
