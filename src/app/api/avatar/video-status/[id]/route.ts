import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const maxDuration = 30;

async function getKlingToken(): Promise<string> {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;
  if (!accessKey || !secretKey) throw new Error("KLING keys not configured");

  const now = Math.floor(Date.now() / 1000);
  const secret = new TextEncoder().encode(secretKey);

  return new SignJWT({ iss: accessKey })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now - 5)
    .setExpirationTime(now + 1800)
    .sign(secret);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const token = await getKlingToken();

    const res = await fetch(`https://api.klingai.com/v1/videos/image2video/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Kling ${res.status}` }, { status: 500 });
    }

    const data = (await res.json()) as {
      data?: {
        task_status?: string;
        task_result?: { videos?: { url?: string }[] };
      };
    };

    const status = data.data?.task_status ?? "submitted";
    const videoUrl = data.data?.task_result?.videos?.[0]?.url ?? null;

    // Map Kling statuses → our frontend statuses
    const mapped =
      status === "succeed"
        ? "COMPLETED"
        : status === "failed"
          ? "FAILED"
          : "IN_PROGRESS";

    return NextResponse.json({ status: mapped, videoUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
