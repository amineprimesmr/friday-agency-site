import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const ANALYSIS_PROMPT = `You are an expert at analyzing people's physical appearance for photorealistic image generation.

Look at this person carefully and generate an ultra-detailed master prompt that captures EVERY visible feature.

Return ONLY a single dense descriptive paragraph (no headers, no lists, no extra text) starting with "A [age range]-year-old [gender]" that describes:
- Exact ethnicity, skin tone (warm/cool/neutral undertone, light/medium/dark), skin texture and complexion
- Face shape, jawline definition, cheekbone structure, chin shape
- Eyes: exact color, shape (almond/round/hooded/etc), any notable features; eyebrows: thickness, arch, color
- Nose shape; lips: fullness, color; overall expression/energy
- Hair: exact style, length, texture (straight/wavy/coily/etc), color with highlights if any, any fade or cut details
- Facial hair: describe precisely, or state "clean-shaven" or "no facial hair"
- ALL visible accessories: glasses (describe frame shape, material, color), earrings, necklace, rings, hat
- Outfit: describe EVERY visible piece with fabric texture, exact color, cut and fit
- Body build and posture if visible

End with exactly this quality suffix:
", photorealistic, hyperrealistic, ultra-sharp, 8K resolution, RAW photo, DSLR, professional studio photography, 85mm prime lens, f/2.0 aperture, perfect skin texture, subsurface scattering, studio three-point lighting, neutral white background."

Return ONLY the prompt, nothing else. No introduction, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = (await req.json()) as {
      imageBase64: string;
      mimeType?: string;
    };

    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } }).error?.message ?? res.statusText;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const masterPrompt = data.choices?.[0]?.message?.content?.trim();
    if (!masterPrompt) {
      return NextResponse.json({ error: "No prompt returned from GPT-4o" }, { status: 500 });
    }

    return NextResponse.json({ masterPrompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
