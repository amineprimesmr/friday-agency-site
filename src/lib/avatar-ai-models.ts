/**
 * Libellés affichés dans l’UI pour chaque brique IA (transparence collaborateur).
 */

export const AI_MODEL_LABELS = {
  claudeStudio: `Claude · ${process.env.NEXT_PUBLIC_ANTHROPIC_STUDIO_MODEL?.trim() || "Haiku 4.5"}`,
  claudeVision: `Claude · analyse visuelle (${process.env.NEXT_PUBLIC_ANTHROPIC_STUDIO_MODEL?.trim() || "Haiku 4.5"})`,
  gptImage2: "OpenAI · GPT Image 2 (édition / génération)",
  klingVideo: "Kling · génération vidéo",
} as const;

/** Modèle serveur pour le chat atelier */
export const SERVER_STUDIO_MODEL =
  process.env.ANTHROPIC_STUDIO_MODEL?.trim() ||
  process.env.ANTHROPIC_CAROUSEL_MODEL?.trim() ||
  "claude-haiku-4-5";
