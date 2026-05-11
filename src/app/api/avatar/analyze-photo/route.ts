import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const ANALYSIS_PROMPT = `You are a forensic-level visual describer for photorealistic image synthesis. Study the attached photo.

Write ONE dense English paragraph (no bullet points, no preamble) that begins exactly:
"A [approximate age]-year-old [gender] person with"

You MUST faithfully describe only what is visible—never invent accessories or clothing not in frame. Include where applicable:

FACE & SKIN: exact skin undertone (warm/cool/neutral), shade, visible texture (pores, matte vs dewy), any moles/freckles/scars, asymmetry that defines identity.

STRUCTURE: face shape; jaw width and angle; chin shape; cheekbone placement; nose bridge width, tip shape, nostril visibility in this angle.

EYES & BROWS: iris color and limbal ring; eye shape; eyelid fold; eyebrow thickness, arch, color, grooming.

MOUTH: lip fullness, color, philtrum; teeth visibility if any.

HAIR: accurate length, part, texture (straight/wavy/coily), density, hairline shape, color, fading or edges if visible.

FACIAL HAIR: exact pattern, length, color—or state cleanly if none.

ACCESSORIES: eyewear (exact frame geometry, material, color, temple details); earrings/chain/piercings/watches—only if visible.

WARDROBE: each garment with fabric (knit, denim, leather…), weave if apparent, exact colors, fit (tight/oversized), logos only if present.

BODY & POSE: visible build, shoulder width, neck length, posture.

AMBIENT: if background affects read (e.g. rim light on face), note it in one short clause at the end of the wardrobe section—not a separate paragraph.

Closing clause (must be part of the same paragraph): tie to photoreal capture—editorial RAW still, natural color science, tack-sharp on eyes, authentic micro-detail, no beauty-filter smoothing.

Output ONLY that single paragraph. No title, no quotes, no "Here is".`;

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
      max_tokens: 1400,
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
