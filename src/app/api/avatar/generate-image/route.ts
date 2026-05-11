import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

async function generateImage(prompt: string, size: string, apiKey: string): Promise<string> {
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
    try { msg = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? msg; } catch {}
    throw new Error(msg);
  }

  let data: { data?: { url?: string; b64_json?: string }[] };
  try { data = JSON.parse(text); } catch { throw new Error("Invalid JSON from OpenAI: " + text.slice(0, 100)); }

  const item = data.data?.[0];
  if (item?.url) return item.url;
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  throw new Error("No image returned from OpenAI");
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
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

    const imageUrl = await generateImage(prompt, size, apiKey);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
