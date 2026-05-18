import { NextResponse } from "next/server";

import { scanTrackappResources } from "@/lib/trackapp-ressources/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { baseDir, items } = await scanTrackappResources();
  return NextResponse.json(
    {
      configured: Boolean(baseDir),
      items,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
