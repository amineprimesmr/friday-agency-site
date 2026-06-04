import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import { findPreciseApplabCompetitors } from "@/lib/trackapp-applab-project/find-competitors";
import type {
  ApplabConceptAssessment,
  ApplabConceptUnderstanding,
} from "@/lib/trackapp-applab-project/types";

export const maxDuration = 60;

type Body = Readonly<{
  concept?: string;
  name?: string;
  country?: string;
  understanding?: ApplabConceptUnderstanding | null;
  assessment?: ApplabConceptAssessment | null;
}>;

function minimalUnderstanding(concept: string): ApplabConceptUnderstanding {
  return {
    core_problem: concept,
    target_user: "À définir",
    main_use_case: concept,
    niche: concept.slice(0, 280),
    specific_subject: concept,
    language_or_market: "fr",
    monetization: "À définir",
    key_features: [],
    not_competitors: [],
    search_queries: [concept.slice(0, 48)],
    must_match: [],
  };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const concept = (body.concept ?? "").trim();
  const name = (body.name ?? "").trim();
  const country = normalizeTrackerCountryParam(body.country) as CountryCode;
  const understanding = body.understanding ?? minimalUnderstanding(concept);

  if (concept.length < 8) {
    return NextResponse.json({ apps: [], queriesUsed: [] }, { status: 200 });
  }

  try {
    const result = await findPreciseApplabCompetitors({
      name,
      concept,
      understanding,
      assessment: body.assessment ?? null,
      country,
    });

    return NextResponse.json(
      {
        apps: result.apps.map((app) => ({
          id: app.id,
          name: app.name,
          artistName: app.artistName,
          category: app.category,
          artworkUrl: app.artworkUrl,
          revenueDisplay: app.revenueDisplay,
          relevanceScore: app.relevanceScore,
          relevanceReason: app.relevanceReason,
          rank: app.rank,
        })),
        queriesUsed: result.queriesUsed,
        aiPowered: result.aiRanked ?? false,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json({ apps: [], queriesUsed: [], aiPowered: false }, { status: 200 });
  }
}
