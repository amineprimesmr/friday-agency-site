import { NextResponse } from "next/server";

/** Indique si le jeton serveur Meta Ad Library est configuré (sans appeler Graph). */
export async function GET() {
  const configured = Boolean(process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim());
  return NextResponse.json({ configured });
}
