import { NextRequest, NextResponse } from "next/server";
import { extensionForMime, openaiUploadBuffer } from "@/lib/openai-avatar";

export const maxDuration = 60;
export const runtime = "nodejs";

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

    const buffer = Buffer.from(imageBase64, "base64");
    const ext = extensionForMime(mimeType);
    const fileId = await openaiUploadBuffer(apiKey, buffer, `avatar-reference.${ext}`, mimeType);

    return NextResponse.json({ fileId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
