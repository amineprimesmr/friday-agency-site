import {
  extractImageFromOpenAIResponse,
  openaiUploadBuffer,
} from "@/lib/openai-avatar";

/** Portrait default — override with OPENAI_AVATAR_IMAGE_SIZE=e.g. 1024x1024 for speed. */
export const DEFAULT_AVATAR_IMAGE_SIZE =
  process.env.OPENAI_AVATAR_IMAGE_SIZE ?? "1024x1536";

/** low | medium | high | auto — default high for photorealistic edits; set medium locally for speed. */
export function avatarEditQuality(): string | undefined {
  const q = (process.env.OPENAI_AVATAR_EDIT_QUALITY ?? "high").trim().toLowerCase();
  if (q === "off" || q === "none") return undefined;
  if (q === "low" || q === "medium" || q === "high" || q === "auto") return q;
  return "high";
}

export async function generateAvatarFromText(
  prompt: string,
  size: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt,
      n: 1,
      size,
    }),
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
): Promise<{ imageUrl: string; outputFileId: string }> {
  const body: Record<string, unknown> = {
    model: "gpt-image-2",
    prompt,
    n: 1,
    size,
    output_format: "png",
    images: referenceFileIds.map((id) => ({ file_id: id })),
  };
  const q = avatarEditQuality();
  if (q) body.quality = q;

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
}): Promise<{ imageUrl: string; outputFileId?: string }> {
  const ids = args.referenceFileIds.filter(Boolean);
  if (ids.length > 0) {
    return generateAvatarFromReferenceEdits(
      args.prompt,
      args.size,
      ids,
      args.apiKey,
    );
  }
  const imageUrl = await generateAvatarFromText(
    args.prompt,
    args.size,
    args.apiKey,
  );
  return { imageUrl };
}
