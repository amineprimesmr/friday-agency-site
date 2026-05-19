import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import { loadTrackappClonePromptBundle } from "@/lib/trackapp-clone-prompt/load-bundle";
import {
  parseCloneAngleParam,
  parseCloneStackParam,
} from "@/lib/trackapp-clone-prompt/parse-options";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const appId = (searchParams.get("appId") ?? searchParams.get("id") ?? "").trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country")) as CountryCode;
  const stack = parseCloneStackParam(searchParams.get("stack"));
  const angle = parseCloneAngleParam(searchParams.get("angle"));

  if (!appId || !/^\d+$/.test(appId)) {
    return NextResponse.json({ error: "appId requis (identifiant numérique App Store)" }, { status: 400 });
  }

  try {
    const bundle = await loadTrackappClonePromptBundle(appId, country, { stack, angle });
    if (!bundle) {
      return NextResponse.json({ error: "App introuvable" }, { status: 404 });
    }

    return NextResponse.json(bundle, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
