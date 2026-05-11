import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const maxDuration = 30;

async function getKlingToken(): Promise<string> {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;
  if (!accessKey || !secretKey) throw new Error("KLING_ACCESS_KEY / KLING_SECRET_KEY not configured");

  const now = Math.floor(Date.now() / 1000);
  const secret = new TextEncoder().encode(secretKey);

  return new SignJWT({ iss: accessKey })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now - 5)
    .setExpirationTime(now + 1800)
    .sign(secret);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageUrl, duration = "10" } = (await req.json()) as {
      prompt: string;
      imageUrl: string;
      duration?: "5" | "10";
    };

    if (!prompt || !imageUrl) {
      return NextResponse.json({ error: "prompt and imageUrl required" }, { status: 400 });
    }

    const token = await getKlingToken();

    const res = await fetch("https://api.klingai.com/v1/videos/image2video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "kling-v2-1",
        image_url: imageUrl,
        prompt,
        duration,
        mode: "pro",
        aspect_ratio: "16:9",
        cfg_scale: 0.5,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Kling error ${res.status}: ${text}` }, { status: 500 });
    }

    const data = (await res.json()) as { data?: { task_id?: string } };
    const taskId = data.data?.task_id;

    if (!taskId) {
      return NextResponse.json({ error: "No task_id from Kling" }, { status: 500 });
    }

    return NextResponse.json({ requestId: taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
