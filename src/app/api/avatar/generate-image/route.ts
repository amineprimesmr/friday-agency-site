import { NextRequest, NextResponse } from "next/server";
import {
  extractImageFromOpenAIResponse,
  openaiUploadBuffer,
} from "@/lib/openai-avatar";

/** Vercel Pro (or higher) allows up to 300s; GPT Image 2 edits can run a long time. */
export const maxDuration = 300;
export const runtime = "nodejs";

async function generateFromText(
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

async function generateFromReferenceEdits(
  prompt: string,
  size: string,
  referenceFileIds: string[],
  apiKey: string,
): Promise<{ imageUrl: string; outputFileId: string }> {
  // gpt-image-2 rejects input_fidelity (supported on some older GPT image edit models only).
  const body: Record<string, unknown> = {
    model: "gpt-image-2",
    prompt,
    n: 1,
    size,
    quality: "high",
    output_format: "png",
    images: referenceFileIds.map((id) => ({ file_id: id })),
  };

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

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      size = "1024x1536",
      referenceFileIds,
    } = (await req.json()) as {
      prompt: string;
      referenceFileIds?: string[];
      size?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const ids = referenceFileIds?.filter(Boolean) ?? [];

    if (ids.length > 0) {
      const { imageUrl, outputFileId } = await generateFromReferenceEdits(
        prompt,
        size,
        ids,
        apiKey,
      );
      return NextResponse.json({ imageUrl, outputFileId });
    }

    const imageUrl = await generateFromText(prompt, size, apiKey);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
