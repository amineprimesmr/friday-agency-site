import { NextResponse } from "next/server";

/** Indique si les identifiants serveur TikTok Ad Library sont présents (sans appeler TikTok). */
export async function GET() {
  const configured = Boolean(
    process.env.TIKTOK_CLIENT_KEY?.trim() && process.env.TIKTOK_CLIENT_SECRET?.trim(),
  );
  return NextResponse.json({ configured });
}
