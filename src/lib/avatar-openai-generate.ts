import {
  extractImageFromOpenAIResponse,
  openaiUploadBuffer,
} from "@/lib/openai-avatar";

/** Default square for lower latency & cost vs portrait — override with OPENAI_AVATAR_IMAGE_SIZE (e.g. 1024x1536). */
export const DEFAULT_AVATAR_IMAGE_SIZE =
  process.env.OPENAI_AVATAR_IMAGE_SIZE ?? "1024x1024";

function normalizeGenerationQuality(explicit?: string | null): "low" | "medium" | "high" | "auto" {
  const fromEnv = process.env.OPENAI_IMAGE_GEN_QUALITY?.trim().toLowerCase();
  const raw = (explicit?.trim().toLowerCase() || fromEnv || "high") as string;
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "auto") return raw;
  return "high";
}

function imageApiModeration(): "auto" | "low" {
  return process.env.OPENAI_IMAGE_MODERATION?.trim().toLowerCase() === "low" ? "low" : "auto";
}

/** low | medium | high | auto — default medium balances quality & cost; set OPENAI_AVATAR_EDIT_QUALITY=high if needed. */
export function avatarEditQuality(): string | undefined {
  const q = (process.env.OPENAI_AVATAR_EDIT_QUALITY ?? "medium").trim().toLowerCase();
  if (q === "off" || q === "none") return undefined;
  if (q === "low" || q === "medium" || q === "high" || q === "auto") return q;
  return "medium";
}

export async function generateAvatarFromText(
  prompt: string,
  size: string,
  apiKey: string,
  qualityOverride?: string | null,
): Promise<string> {
  const quality = normalizeGenerationQuality(qualityOverride);
  const body: Record<string, unknown> = {
    model: "gpt-image-2",
    prompt,
    n: 1,
    size,
    quality,
    output_format: "png",
  };
  if (imageApiModeration() === "low") {
    body.moderation = "low";
  }

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    let msg = res.statusText;
    try {
      msg =
        (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const { b64, url } = extractImageFromOpenAIResponse(text);
  if (url) return url;
  if (b64) return `data:image/png;base64,${b64}`;
  throw new Error("No image returned from OpenAI");
}

export async function generateAvatarFromReferenceEdits(
  prompt: string,
  size: string,
  referenceFileIds: string[],
  apiKey: string,
  qualityOverride?: string | null,
): Promise<{ imageUrl: string; outputFileId: string }> {
  const body: Record<string, unknown> = {
    model: "gpt-image-2",
    prompt,
    n: 1,
    size,
    output_format: "png",
    images: referenceFileIds.map((id) => ({ file_id: id })),
  };
  const o = qualityOverride?.trim().toLowerCase();
  const q =
    o === "low" || o === "medium" || o === "high" || o === "auto"
      ? o
      : avatarEditQuality();
  if (q) body.quality = q;
  if (imageApiModeration() === "low") {
    body.moderation = "low";
  }

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    let msg = res.statusText;
    try {
      msg =
        (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const { b64, url } = extractImageFromOpenAIResponse(text);
  let imageUrl: string;
  if (url) imageUrl = url;
  else if (b64) imageUrl = `data:image/png;base64,${b64}`;
  else throw new Error("No image returned from OpenAI edits");

  let png: Buffer;
  if (b64) {
    png = Buffer.from(b64, "base64");
  } else if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error("Could not download edited image for file upload");
    png = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error("No image bytes from OpenAI edits");
  }

  const outputFileId = await openaiUploadBuffer(
    apiKey,
    png,
    `avatar-output-${Date.now()}.png`,
    "image/png",
  );

  return { imageUrl, outputFileId };
}

export async function runAvatarImageGeneration(args: {
  prompt: string;
  size: string;
  referenceFileIds: string[];
  apiKey: string;
  quality?: string | null;
}): Promise<{ imageUrl: string; outputFileId?: string }> {
  const ids = args.referenceFileIds.filter(Boolean);
  if (ids.length > 0) {
    return generateAvatarFromReferenceEdits(
      args.prompt,
      args.size,
      ids,
      args.apiKey,
      args.quality,
    );
  }
  const imageUrl = await generateAvatarFromText(
    args.prompt,
    args.size,
    args.apiKey,
    args.quality,
  );
  return { imageUrl };
}
