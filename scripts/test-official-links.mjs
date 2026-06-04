import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
try {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
} catch {
  /* ignore */
}

const { fetchAppDetail } = await import("../src/lib/apple-charts.ts");
const { resolveOfficialBrandLinks } = await import("../src/lib/official-brand-links.ts");

const id = process.argv[2] || "570060128";
const app = await fetchAppDetail(id, "fr");
if (!app) {
  console.error("App not found");
  process.exit(1);
}

console.log("OpenAI configured:", Boolean(process.env.OPENAI_API_KEY?.trim()));
console.log("Resolving:", app.name);
const r = await resolveOfficialBrandLinks(app);
for (const k of [
  "site",
  "instagram",
  "tiktok",
  "x",
  "youtube",
  "facebook",
  "linkedin",
  "threads",
  "metaAdsLibrary",
]) {
  const row = r[k];
  console.log(`${k}:`, row.validated ? row.url : `— ${row.reason.slice(0, 80)}`);
}
console.log("socialProfiles:", r.socialProfiles.length, "confidence:", r.confidence);
