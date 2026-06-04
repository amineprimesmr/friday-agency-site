import { NextResponse } from "next/server";

import {
  assessApplabConcept,
  finalizeApplabConceptClarify,
  startApplabConceptClarify,
  suggestApplabClarifyAnswer,
} from "@/lib/trackapp-applab-project/analyze-concept";
import type {
  ApplabConceptAnswers,
  ApplabConceptUnderstanding,
  ApplabClarifyingQuestion,
} from "@/lib/trackapp-applab-project/types";

export const maxDuration = 60;

type Body = Readonly<{
  action?: "start" | "finalize" | "suggest" | "assess";
  name?: string;
  concept?: string;
  answers?: ApplabConceptAnswers;
  questions?: ApplabClarifyingQuestion[];
  understanding?: ApplabConceptUnderstanding | null;
  questionId?: string;
}>;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const action = body.action ?? "start";
  const name = (body.name ?? "").trim();
  const concept = (body.concept ?? "").trim();

  if (name.length < 2 || concept.length < 12) {
    return NextResponse.json(
      { error: "Nom (≥2) et concept (≥12 caractères) requis." },
      { status: 400 },
    );
  }

  if (action === "assess") {
    const understanding = body.understanding;
    if (!understanding) {
      return NextResponse.json({ error: "Understanding manquant." }, { status: 400 });
    }

    const result = await assessApplabConcept({
      name,
      concept,
      understanding,
      answers: body.answers ?? {},
      questions: body.questions ?? [],
    });

    if (!result.assessment) {
      return NextResponse.json(
        {
          error: "Analyse indisponible",
          failure: result.failure,
          failureDetail: result.failureDetail,
        },
        { status: result.failure === "openai_missing_key" ? 503 : 502 },
      );
    }

    return NextResponse.json(
      { assessment: result.assessment },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  if (action === "suggest") {
    const questions = body.questions ?? [];
    const questionId = body.questionId?.trim();
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: "Question introuvable." }, { status: 400 });
    }

    const result = await suggestApplabClarifyAnswer({
      name,
      concept,
      question,
      answers: body.answers ?? {},
      questions,
    });

    if (!result.suggestion) {
      return NextResponse.json(
        {
          error: "Suggestion indisponible",
          failure: result.failure,
          failureDetail: result.failureDetail,
        },
        { status: result.failure === "openai_missing_key" ? 503 : 502 },
      );
    }

    return NextResponse.json(
      { suggestion: result.suggestion },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  if (action === "finalize") {
    const questions = body.questions ?? [];
    if (questions.length === 0) {
      return NextResponse.json({ error: "Aucune question à finaliser." }, { status: 400 });
    }

    const result = await finalizeApplabConceptClarify({
      name,
      concept,
      answers: body.answers ?? {},
      questions,
    });

    if (!result.understanding) {
      return NextResponse.json(
        {
          error: "Synthèse indisponible",
          failure: result.failure,
          failureDetail: result.failureDetail,
        },
        { status: result.failure === "openai_missing_key" ? 503 : 502 },
      );
    }

    return NextResponse.json(
      {
        status: "ready_to_assess",
        understanding: result.understanding,
        questions,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  const result = await startApplabConceptClarify({ name, concept });

  if (result.questions.length === 0) {
    return NextResponse.json(
      {
        error: "Questions indisponibles",
        failure: result.failure,
        failureDetail: result.failureDetail,
      },
      { status: result.failure === "openai_missing_key" ? 503 : 502 },
    );
  }

  return NextResponse.json(
    {
      status: "needs_clarification",
      questions: result.questions,
      understanding: null,
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
