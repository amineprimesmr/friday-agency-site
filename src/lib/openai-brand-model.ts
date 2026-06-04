/** Modèle OpenAI OSINT marque / présence officielle (web_search + validation). */
export const DEFAULT_BRAND_OSINT_OPENAI_MODEL = "gpt-4.1";

export function getBrandOsintOpenAiModel(): string {
  return process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() || DEFAULT_BRAND_OSINT_OPENAI_MODEL;
}
