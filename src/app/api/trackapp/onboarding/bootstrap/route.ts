import { NextResponse } from "next/server";

import { loadTrackappOnboardingPageProps } from "@/lib/trackapp-onboarding/load-onboarding-page-props";

export const dynamic = "force-dynamic";

/** Données onboarding pour l’overlay client (évite un re-render RSC complet). */
export async function GET() {
  try {
    const props = await loadTrackappOnboardingPageProps();
    return NextResponse.json(props, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Bootstrap onboarding indisponible" }, { status: 500 });
  }
}
