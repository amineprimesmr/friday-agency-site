import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { generateApplabMvpPrompt } from "@/lib/trackapp-applab-create/generate-mvp-prompt";
import { APPLAB_MVP_STACK } from "@/lib/trackapp-applab-create/mvp-prompt-types";
import type { ApplabCreateConstraints } from "@/lib/trackapp-applab-create/mvp-prompt-types";
import type {
  ApplabConceptAnswers,
  ApplabConceptAssessment,
  ApplabConceptUnderstanding,
  ApplabClarifyingQuestion,
} from "@/lib/trackapp-applab-project/types";
import type { CountryCode } from "@/lib/apple-charts";

export const maxDuration = 90;

type Body = Readonly<{
  name?: string;
  concept?: string;
  understanding?: ApplabConceptUnderstanding;
  assessment?: ApplabConceptAssessment;
  answers?: ApplabConceptAnswers;
  questions?: ApplabClarifyingQuestion[];
  constraints?: ApplabCreateConstraints;
  referenceAppId?: string | null;
  referenceAppName?: string | null;
  referenceCountry?: CountryCode;
  versionNumber?: number;
  versionId?: string;
}>;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const concept = (body.concept ?? "").trim();

  if (name.length < 2 || concept.length < 12) {
    return NextResponse.json(
      { error: "Nom (≥2) et concept (≥12 caractères) requis." },
      { status: 400 },
    );
  }

  const stack = APPLAB_MVP_STACK;

  const understanding = body.understanding;
  const assessment = body.assessment;
  if (!understanding || !assessment) {
    return NextResponse.json(
      { error: "Understanding et assessment requis." },
      { status: 400 },
    );
  }

  const versionNumber = Math.max(1, body.versionNumber ?? 1);
  const versionId = body.versionId?.trim() || randomUUID();

  const result = await generateApplabMvpPrompt({
    projectName: name,
    concept,
    stack,
    understanding,
    assessment,
    answers: body.answers ?? {},
    questions: body.questions ?? [],
    constraints: body.constraints ?? { mustHave: "", mustNot: "" },
    referenceAppId: body.referenceAppId,
    referenceCountry: body.referenceCountry ?? "fr",
    versionNumber,
    versionId,
  });

  if (!result.bundle) {
    return NextResponse.json(
      {
        error: "Génération du prompt indisponible",
        failure: result.failure,
        failureDetail: result.failureDetail,
      },
      { status: result.failure === "openai_missing_key" ? 503 : 502 },
    );
  }

  return NextResponse.json(
    { bundle: result.bundle },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
