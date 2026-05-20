/**
 * Debug local : appelle OpenAI comme analyze.ts et affiche la réponse brute.
 * Usage: node --env-file=.env.local scripts/debug-competitors-openai.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "../src/lib/trackapp-competitor-intelligence/schema.ts");
// Minimal inline schema subset for test — full schema imported via dynamic import won't work from .mjs easily.
// We'll import compiled approach: fetch with small schema first.

const key = process.env.OPENAI_API_KEY?.trim();
if (!key) {
  console.error("OPENAI_API_KEY manquante");
  process.exit(1);
}

const model = process.env.TRACKAPP_COMPETITOR_OPENAI_MODEL?.trim() || process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() || "gpt-4o-mini";

const COMPETITOR_INTELLIGENCE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    source_app: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        core_problem: { type: "string" },
        target_user: { type: "string" },
        category: { type: "string" },
        positioning: { type: "string" },
        main_features: { type: "array", items: { type: "string" }, maxItems: 12 },
        not_competitors: { type: "array", items: { type: "string" }, maxItems: 10 },
      },
      required: ["name", "core_problem", "target_user", "category", "positioning", "main_features", "not_competitors"],
    },
    understanding: {
      type: "object",
      additionalProperties: false,
      properties: {
        core_problem: { type: "string" },
        target_user: { type: "string" },
        main_use_case: { type: "string" },
        secondary_use_cases: { type: "array", items: { type: "string" }, maxItems: 8 },
        category: { type: "string" },
        positioning: { type: "string" },
        main_features: { type: "array", items: { type: "string" }, maxItems: 12 },
        monetization: { type: "string" },
        marketing_angles: { type: "array", items: { type: "string" }, maxItems: 8 },
        keywords: { type: "array", items: { type: "string" }, maxItems: 16 },
        not_competitors: { type: "array", items: { type: "string" }, maxItems: 10 },
        competitor_categories: { type: "array", items: { type: "string" }, maxItems: 8 },
      },
      required: [
        "core_problem", "target_user", "main_use_case", "secondary_use_cases", "category",
        "positioning", "main_features", "monetization", "marketing_angles", "keywords",
        "not_competitors", "competitor_categories",
      ],
    },
    competitor_categories: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          apps: { type: "array", items: { type: "string" }, maxItems: 12 },
        },
        required: ["name", "description", "apps"],
      },
    },
    competitors: {
      type: "array",
      maxItems: 15,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          type: { type: "string", enum: ["direct", "close", "indirect", "old", "rising"] },
          similarity_score: { type: "number", minimum: 0, maximum: 100 },
          reason: { type: "string" },
          app_store_url: { type: ["string", "null"] },
          google_play_url: { type: ["string", "null"] },
          website: { type: ["string", "null"] },
          category: { type: "string" },
          description: { type: "string" },
          shared_features: { type: "array", items: { type: "string" }, maxItems: 8 },
          differences: { type: "array", items: { type: "string" }, maxItems: 8 },
          target_user: { type: "string" },
          pricing: { type: "string" },
          traction_signals: {
            type: "object",
            additionalProperties: false,
            properties: {
              rating: { type: "string" },
              reviews_count: { type: "string" },
              social_activity: { type: "string" },
              ads_activity: { type: "string" },
              ranking: { type: "string" },
            },
            required: ["rating", "reviews_count", "social_activity", "ads_activity", "ranking"],
          },
          social_links: {
            type: "object",
            additionalProperties: false,
            properties: {
              instagram: { type: "string" },
              tiktok: { type: "string" },
              x: { type: "string" },
              youtube: { type: "string" },
              facebook: { type: "string" },
              linkedin: { type: "string" },
            },
            required: ["instagram", "tiktok", "x", "youtube", "facebook", "linkedin"],
          },
          meta_ads_library: { type: ["string", "null"] },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: [
          "name", "type", "similarity_score", "reason", "app_store_url", "google_play_url", "website",
          "category", "description", "shared_features", "differences", "target_user", "pricing",
          "traction_signals", "social_links", "meta_ads_library", "confidence",
        ],
      },
    },
    rejected_apps: {
      type: "array",
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        properties: { name: { type: "string" }, reason: { type: "string" } },
        required: ["name", "reason"],
      },
    },
    search_queries_used: { type: "array", items: { type: "string" }, maxItems: 20 },
  },
  required: ["source_app", "understanding", "competitor_categories", "competitors", "rejected_apps", "search_queries_used"],
};

const prompt = "Analyse les concurrents de Blow Up AI (app audit TikTok créateurs). Réponds en JSON strict.";

const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model,
    temperature: 0.1,
    tools: [{ type: "web_search", external_web_access: true }],
    input: [{ role: "user", content: prompt }],
    text: {
      format: {
        type: "json_schema",
        name: "trackapp_competitor_intelligence",
        strict: true,
        schema: COMPETITOR_INTELLIGENCE_JSON_SCHEMA,
      },
    },
  }),
});

console.log("status", res.status, res.statusText);
const body = await res.json();
if (!res.ok) {
  console.log("error body", JSON.stringify(body, null, 2).slice(0, 3000));
  process.exit(1);
}

console.log("keys", Object.keys(body));
console.log("output_text?", typeof body.output_text, body.output_text?.slice?.(0, 200));
console.log("output len", Array.isArray(body.output) ? body.output.length : "n/a");
if (Array.isArray(body.output)) {
  for (const item of body.output) {
    console.log(" output item type", item?.type);
    if (item?.content) {
      for (const p of item.content) {
        console.log("  part type", p?.type, "text len", p?.text?.length);
      }
    }
  }
}
