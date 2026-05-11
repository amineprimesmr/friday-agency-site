import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const ANALYSIS_PROMPT = `Analyze the visual design elements of this image to create a detailed character art prompt for a digital artist.

Describe ALL visible elements in a single dense paragraph starting with "A [approximate age]-year-old [gender] character with":
- Skin tone and texture (warm/cool/neutral undertone, specific shade)
- Face shape, jawline, cheekbones, chin
- Eyes: color, shape, distinctive features; eyebrows: thickness, arch, color
- Nose, lips (fullness, color), overall expression
- Hair: exact style, length, texture, color, styling details
- Facial hair if any
- ALL accessories: glasses (frame shape, material, color), earrings, other jewelry
- Outfit: every visible garment with fabric, exact color, cut, fit
- Body type and posture if visible

End with: ", photorealistic, hyperrealistic, ultra-sharp detail, 8K resolution, professional studio photography, 85mm lens, f/2.0, perfect lighting, neutral white background."

Output ONLY the description paragraph. No intro, no commentary.`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = (await req.json()) as {
      imageBase64: string;
      mimeType?: string;
    };

    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    const block = response.content[0];
    const masterPrompt = block.type === "text" ? block.text.trim() : null;

    if (!masterPrompt) {
      return NextResponse.json({ error: "Aucun prompt retourné" }, { status: 500 });
    }

    return NextResponse.json({ masterPrompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
