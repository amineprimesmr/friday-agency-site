/**
 * Enrichissement optionnel des liens marque (réseaux + Facebook pour Ad Library)
 * quand la fiche App Store ne contient pas assez d’URLs — modèle OpenAI, sans navigation web.
 */

export type OpenAiBrandFootprint = {
  official_website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  youtube_url: string | null;
  snapchat_url: string | null;
  pinterest_url: string | null;
  threads_url: string | null;
  linkedin_url: string | null;
  /** 0–1 — plus bas = moins utiliser le lien Facebook pour résolution Graph */
  confidence: number;
  sources: string[];
};

function pickUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s || s === "null") return null;
  if (!/^https:\/\//i.test(s)) return null;
  try {
    new URL(s);
    return s;
  } catch {
    return null;
  }
}

function pickConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function pickStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => /^https:\/\//i.test(x))
    .slice(0, 8);
}

function extractResponseText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text;
  }

  const output = record.output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as Record<string, unknown>).text;
      if (typeof text === "string" && text.trim()) return text;
    }
  }
  return null;
}

/**
 * Recherche les comptes publics probables pour une app via Responses API + web_search.
 * Les URLs restent des candidates : elles sont validées ensuite (parse + Graph + Ad Library).
 */
export async function inferBrandFootprintWithOpenAI(args: {
  appName: string;
  developerName: string;
  genre: string;
  descriptionSnippet: string;
}): Promise<OpenAiBrandFootprint | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() || "gpt-4.1-mini";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      tools: [{ type: "web_search" }],
      text: {
        format: {
          type: "json_schema",
          name: "mobile_app_brand_footprint",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              official_website_url: { type: ["string", "null"] },
              facebook_url: { type: ["string", "null"] },
              instagram_url: { type: ["string", "null"] },
              tiktok_url: { type: ["string", "null"] },
              x_url: { type: ["string", "null"] },
              youtube_url: { type: ["string", "null"] },
              snapchat_url: { type: ["string", "null"] },
              pinterest_url: { type: ["string", "null"] },
              threads_url: { type: ["string", "null"] },
              linkedin_url: { type: ["string", "null"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              sources: {
                type: "array",
                items: { type: "string" },
                maxItems: 8,
              },
            },
            required: [
              "official_website_url",
              "facebook_url",
              "instagram_url",
              "tiktok_url",
              "x_url",
              "youtube_url",
              "snapchat_url",
              "pinterest_url",
              "threads_url",
              "linkedin_url",
              "confidence",
              "sources",
            ],
          },
        },
      },
      input: [
        {
          role: "system",
          content:
            "Tu identifies les liens officiels d'une application mobile et de sa marque. Utilise la recherche web. " +
            "Ne renvoie que des URLs officielles fortement probables. Si le lien est incertain, mets null. " +
            "La clé facebook_url est critique car elle doit correspondre à la Page Facebook/Meta officielle qui diffuse les publicités de la marque, pas à une recherche mot-clé.",
        },
        {
          role: "user",
          content: [
            `Application: ${args.appName}`,
            `Éditeur / développeur: ${args.developerName}`,
            `Catégorie App Store: ${args.genre}`,
            "",
            "Trouve le site officiel et les réseaux sociaux officiels de cette application/marque.",
            "Priorise les sources officielles: site de l'app, pages App Store, pages sociales vérifiées ou cohérentes.",
            "",
            "Extrait de description App Store:",
            args.descriptionSnippet.slice(0, 1600),
          ].join("\n"),
        },
      ],
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as unknown;
  const text = extractResponseText(data);
  if (!text) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }

  return {
    official_website_url: pickUrl(parsed.official_website_url),
    facebook_url: pickUrl(parsed.facebook_url),
    instagram_url: pickUrl(parsed.instagram_url),
    tiktok_url: pickUrl(parsed.tiktok_url),
    x_url: pickUrl(parsed.x_url),
    youtube_url: pickUrl(parsed.youtube_url),
    snapchat_url: pickUrl(parsed.snapchat_url),
    pinterest_url: pickUrl(parsed.pinterest_url),
    threads_url: pickUrl(parsed.threads_url),
    linkedin_url: pickUrl(parsed.linkedin_url),
    confidence: pickConfidence(parsed.confidence),
    sources: pickStringArray(parsed.sources),
  };
}

export function footprintToUrlList(f: OpenAiBrandFootprint): string[] {
  return [
    f.official_website_url,
    f.facebook_url,
    f.instagram_url,
    f.tiktok_url,
    f.x_url,
    f.youtube_url,
    f.snapchat_url,
    f.pinterest_url,
    f.threads_url,
    f.linkedin_url,
  ].filter((x): x is string => Boolean(x));
}
