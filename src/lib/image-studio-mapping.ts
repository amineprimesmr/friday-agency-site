/** Mapping UI (Higgsfield-like) → paramètres API OpenAI gpt-image-2 */

export type ImageStudioAspectId =
  | "auto"
  | "1:1"
  | "3:2"
  | "2:3"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "21:9";

export const ASPECT_OPTIONS: {
  id: ImageStudioAspectId;
  label: string;
  /** Fallback / aperçu grille uniquement — l’API utilise `openaiGenerationSizeForAspect`. */
  size: string;
}[] = [
  { id: "auto", label: "Auto", size: "1024x1024" },
  { id: "1:1", label: "1:1", size: "1024x1024" },
  { id: "3:2", label: "3:2", size: "1536x1024" },
  { id: "2:3", label: "2:3", size: "1024x1536" },
  { id: "16:9", label: "16:9", size: "1536x1024" },
  { id: "9:16", label: "9:16", size: "1024x1536" },
  { id: "4:3", label: "4:3", size: "1024x1024" },
  { id: "3:4", label: "3:4", size: "1024x1536" },
  { id: "21:9", label: "21:9", size: "1536x1024" },
];

/**
 * Résolutions pour gpt-image-2 : proche du palier 2K avec total pixels ≤ ~3.69M px
 * (repère « fiabilité » OpenAI, au-dessus = plus expérimental).
 * @see https://developers.openai.com/docs/guides/image-generation
 */
export function openaiGenerationSizeForAspect(id: ImageStudioAspectId): string {
  switch (id) {
    case "auto":
      return "auto";
    case "1:1":
      return "1920x1920";
    case "16:9":
      return "2560x1440";
    case "9:16":
      return "1440x2560";
    case "3:2":
      return "2304x1536";
    case "2:3":
      return "1536x2304";
    case "4:3":
      return "2176x1632";
    case "3:4":
      return "1632x2176";
    case "21:9":
      return "2912x1248";
    default:
      return "1920x1920";
  }
}

export type ImageStudioQualityUi = "low" | "mid" | "high";

export function qualityToApi(q: ImageStudioQualityUi): "low" | "medium" | "high" {
  if (q === "mid") return "medium";
  return q;
}

export type ImageStudioModelId = "gpt-image-2";

export const IMAGE_MODELS: {
  id: ImageStudioModelId;
  label: string;
  description: string;
  enabled: boolean;
  badge?: string;
}[] = [
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    description: "Édition / génération avec références (OpenAI)",
    enabled: true,
    badge: "Défaut",
  },
];

export function creditHintPerImage(quality: ImageStudioQualityUi): number {
  if (quality === "low") return 1;
  if (quality === "mid") return 2;
  return 3;
}

function readPublicEuro(key: string, fallback: number): number {
  if (typeof process === "undefined") return fallback;
  const raw = process.env[key];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * Estimation du coût facturé au user, en € (à caler sur ta marge / prix OpenAI).
 * Surcharge facultative : `NEXT_PUBLIC_STUDIO_EUR_LOW|MID|HIGH`.
 */
export function euroPerImage(quality: ImageStudioQualityUi, resolution: "1k" | "2k"): number {
  const resMult = resolution === "2k" ? 1.35 : 1;
  const base =
    quality === "low"
      ? readPublicEuro("NEXT_PUBLIC_STUDIO_EUR_LOW", 0.04)
      : quality === "mid"
        ? readPublicEuro("NEXT_PUBLIC_STUDIO_EUR_MID", 0.08)
        : readPublicEuro("NEXT_PUBLIC_STUDIO_EUR_HIGH", 0.12);
  return Math.round(base * resMult * 100) / 100;
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Consignes API pour éviter la copie rigide de la pose quand scene + personnage sont fournis.
 */
export function buildImageStudioPrompt(userPrompt: string, referenceCount: number): string {
  const t = userPrompt.trim();
  if (referenceCount <= 0) {
    return (
      `${t}\n\n` +
      "—\n" +
      "Render goals (follow the user text above first; use only as defaults where unspecified):\n" +
      "- **Photorealistic** still photograph with believable lighting, shadows, color, and material detail unless the user requests another medium.\n" +
      "- Sharp subject, coherent composition, natural lens character (no CGI look unless requested).\n" +
      "- No watermark, no mock camera UI, no stock overlays, no random text in-frame unless the user asked for text.\n"
    );
  }

  if (referenceCount >= 2) {
    return (
      `${t}\n\n` +
      "[Composition — multiple references] Reference order matches the order the images were added (first = leftmost slot). Follow the user’s instructions above. When references represent different roles (e.g. a person vs. a location):\n" +
      "- Preserve **identity** from character-oriented inputs: face, hair, skin tone, body type, and clothing **style**.\n" +
      "- Take **environment, lighting, camera angle, spatial layout, and props** from scene-oriented references.\n" +
      "- **Do not** reproduce the character reference’s exact pose, head tilt, or framing unless the user explicitly demands the same pose. **Re-pose** the subject so posture, gaze, and gestures fit the target place; match scale, contact shadows, and light direction.\n" +
      "- The result must read as **one coherent photograph**, not a figure pasted onto a background."
    );
  }

  return (
    `${t}\n\n` +
    "[Composition] Use the reference for likeness and wardrobe/style. Unless the user explicitly asks for the **exact same pose and crop**, adapt posture, gaze, and framing to the described scene—avoid a stiff, pixel-aligned copy of the reference pose."
  );
}
