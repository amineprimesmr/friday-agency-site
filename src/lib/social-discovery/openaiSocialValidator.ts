import type { AppDetail } from "@/lib/apple-charts";
import { getBrandOsintOpenAiModel } from "@/lib/openai-brand-model";
import { extractOpenAiResponseText } from "@/lib/openai-responses";
import { brandTokensForApp } from "@/lib/social-discovery/brand-social-heuristic";
import type { LinkCandidate, LinkValidationStatus } from "@/lib/social-discovery/types";

export type AiValidationRow = Readonly<{
  url: string;
  platform: string;
  status: LinkValidationStatus;
  confidence: number;
  evidence: string[];
  reason: string;
}>;

export async function openaiValidateSocialCandidates(
  app: AppDetail,
  officialWebsite: string | null,
  candidates: readonly LinkCandidate[],
): Promise<AiValidationRow[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || candidates.length === 0) return [];

  const model = getBrandOsintOpenAiModel();
  const brandTokens = brandTokensForApp(app, officialWebsite);

  const payload = candidates.map((c) => ({
    url: c.url,
    platform: c.platform,
    source: c.source,
    evidence: c.evidence,
    note: c.note ?? "",
  }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model,
      temperature: 0,
      text: {
        format: {
          type: "json_schema",
          name: "social_link_validator",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    url: { type: "string" },
                    platform: { type: "string" },
                    status: { type: "string", enum: ["validated", "rejected", "uncertain"] },
                    confidence: { type: "number", minimum: 0, maximum: 100 },
                    evidence: { type: "array", items: { type: "string" } },
                    reason: { type: "string" },
                  },
                  required: ["url", "platform", "status", "confidence", "evidence", "reason"],
                },
              },
            },
            required: ["results"],
          },
        },
      },
      input: [
        {
          role: "system",
          content: `Tu es un validateur OSINT strict pour les liens officiels d'applications mobiles.
Ne valide un lien que s'il appartient officiellement à l'app (compte marque, pas témoignage client, pas embed tweet, pas fondateur perso).
Rejette : fans, UGC, tweets /status/, posts Instagram /p/, homonymes, comptes perso d'employés cités sur la landing.
Le handle doit correspondre à la marque (ex. opalapp, withopal pour l'app Opal — PAS clarkishakent ni vivianphung).
Règle : status=validated uniquement si confidence >= 85 et preuves fortes.
status=uncertain ou rejected : ne pas traiter comme officiel.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            app_name: app.name,
            developer: app.sellerName || app.artistName,
            official_website: officialWebsite,
            app_store_url: app.trackViewUrl,
            brand_tokens: brandTokens,
            candidates: payload,
          }),
        },
      ],
    }),
  });

  if (!response.ok) return [];
  const text = extractOpenAiResponseText(await response.json());
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as { results?: AiValidationRow[] };
    return Array.isArray(parsed.results) ? parsed.results : [];
  } catch {
    return [];
  }
}
