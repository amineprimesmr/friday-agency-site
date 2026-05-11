import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

// Generate with reference photo via Responses API (GPT-4o + image_generation tool)
async function generateWithReference(
  prompt: string,
  referenceImageBase64: string,
  mimeType: string,
  size: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: referenceImageBase64,
              },
            },
            {
              type: "input_text",
              text: `Use this photo as the reference for the character's face and features. Generate a photorealistic image based on this person.\n\n${prompt}`,
            },
          ],
        },
      ],
      tools: [
        {
          type: "image_generation",
          quality: "high",
          size,
          output_format: "url",
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI Responses API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    output?: { type: string; result?: string; url?: string }[];
  };

  const imageOutput = data.output?.find((o) => o.type === "image_generation_call");
  const url = imageOutput?.result ?? imageOutput?.url;

  if (!url) throw new Error("No image URL in Responses API response");
  return url;
}

// Generate without reference photo — standard generations endpoint
async function generateTextOnly(
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
      model: "gpt-image-1",
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
      size = "1024x1536",
    } = (await req.json()) as {
      prompt: string;
      referenceImageBase64?: string;
      mimeType?: string;
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
      imageUrl = await generateWithReference(prompt, referenceImageBase64, mimeType, size, apiKey);
    } else {
      imageUrl = await generateTextOnly(prompt, size, apiKey);
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
