import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

type ContentItem =
  | { type: "image_url"; image_url: { url: string } }
  | { type: "text"; text: string };

async function generateWithResponses(
  prompt: string,
  referenceImageBase64: string,
  mimeType: string,
  previousImageUrls: string[],
  size: string,
  apiKey: string,
): Promise<string> {
  const content: ContentItem[] = [];

  // 1. Reference photo (original upload)
  content.push({
    type: "image_url",
    image_url: { url: `data:${mimeType};base64,${referenceImageBase64}` },
  });

  // 2. Previously generated angles (for consistency chain)
  for (const url of previousImageUrls) {
    content.push({ type: "image_url", image_url: { url } });
  }

  // 3. Instruction text
  const prevCount = previousImageUrls.length;
  const refText =
    prevCount > 0
      ? `Use the first image as the face/appearance reference, and the next ${prevCount} image(s) as previously generated angles of the same character — maintain perfect visual consistency across all of them.\n\n`
      : `Use this photo as the reference for the character's face and features. Maintain exact likeness.\n\n`;

  content.push({ type: "text", text: refText + prompt });

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      input: [{ role: "user", content }],
      tools: [{ type: "image_generation", quality: "high", size, output_format: "url" }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI Responses API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    output?: Array<{
      type: string;
      result?: string;
      content?: Array<{ type: string; url?: string; image_url?: string }>;
    }>;
  };

  // Extract image URL from various possible response shapes
  for (const item of data.output ?? []) {
    if (item.type === "image_generation_call" && item.result) {
      // result is either a URL or base64
      return item.result;
    }
    for (const c of item.content ?? []) {
      if (c.url) return c.url;
      if (c.image_url) return c.image_url;
    }
  }

  throw new Error("No image found in Responses API response: " + JSON.stringify(data).slice(0, 300));
}

async function generateTextOnly(prompt: string, size: string, apiKey: string): Promise<string> {
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
      quality: "high",
      output_format: "url",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = (err as { error?: { message?: string } }).error?.message ?? res.statusText;
    throw new Error(msg);
  }

  const data = (await res.json()) as { data?: { url?: string }[] };
  const url = data.data?.[0]?.url;
  if (!url) throw new Error("No image returned from OpenAI");
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      referenceImageBase64,
      mimeType = "image/jpeg",
      previousImageUrls = [],
      size = "1024x1536",
    } = (await req.json()) as {
      prompt: string;
      referenceImageBase64?: string;
      mimeType?: string;
      previousImageUrls?: string[];
      size?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    let imageUrl: string;

    if (referenceImageBase64) {
      imageUrl = await generateWithResponses(
        prompt,
        referenceImageBase64,
        mimeType,
        previousImageUrls,
        size,
        apiKey,
      );
    } else {
      imageUrl = await generateTextOnly(prompt, size, apiKey);
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
