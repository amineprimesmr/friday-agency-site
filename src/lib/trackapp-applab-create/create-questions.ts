import type { ApplabClarifyingQuestion, ApplabConceptUnderstanding } from "@/lib/trackapp-applab-project/types";

import type { ApplabCreateStepId } from "@/lib/trackapp-applab-create/types";

export type ApplabAnswerStepId = "audience" | "problem" | "v1_features" | "pricing";

export type CreateQuestionAnswers = Readonly<Record<string, string>>;

export type CreateQuestionContext = Readonly<{
  name: string;
  concept: string;
  answers: CreateQuestionAnswers;
}>;

export type CreateQuestionField = Readonly<{
  id: ApplabAnswerStepId;
  step: ApplabAnswerStepId;
  question: string;
  help: string;
  placeholder: string;
  examples: readonly string[];
  minLength: number;
  maxLength: number;
  rows: number;
}>;

/** Étapes avec saisie utilisateur (6 questions). */
export const APPLAB_INPUT_STEPS: readonly ApplabCreateStepId[] = [
  "name",
  "concept",
  "audience",
  "problem",
  "v1_features",
  "pricing",
] as const;

export const APPLAB_ANSWER_STEP_ORDER: readonly ApplabAnswerStepId[] = [
  "audience",
  "problem",
  "v1_features",
  "pricing",
] as const;

const FIELD_CONFIG: Record<
  ApplabAnswerStepId,
  Readonly<{
    help: string;
    placeholder: string;
    examples: readonly string[];
    minLength: number;
    maxLength: number;
    rows: number;
  }>
> = {
  audience: {
    help: "Décrivez une vraie personne : profil, âge, situation, pays — pas « tout le monde ».",
    placeholder:
      "Ex. Femmes 25–40 ans, débutantes en musculation à la maison, peu de temps, veulent un plan simple sans salle…",
    examples: [
      "Étudiant 18–24 ans, révisions avec sessions de 10 min",
      "Parents actifs 30–45 ans, organisation familiale",
    ],
    minLength: 12,
    maxLength: 600,
    rows: 3,
  },
  problem: {
    help: "La frustration concrète avant l'app — pas une liste de features. Scène avant / après si possible.",
    placeholder:
      "Ex. Ils abandonnent car les apps fitness sont trop complexes ; ils veulent savoir quoi faire aujourd'hui en 15 min…",
    examples: [
      "Avant : je procrastine. Après : j'ai un plan clair chaque matin",
      "Ils paient déjà une app mais n'utilisent que 10 % des fonctions",
    ],
    minLength: 15,
    maxLength: 600,
    rows: 3,
  },
  v1_features: {
    help: "Maximum 3 fonctionnalités pour la v1 App Store — finies et soumissibles, pas de placeholder.",
    placeholder: "Ex. 1) Parcours guidé du jour  2) Historique & streak  3) Paywall abonnement + essai 7 jours",
    examples: [
      "Quiz quotidien, classement amis, profil stats",
      "Scan repas, macros, objectif poids",
    ],
    minLength: 12,
    maxLength: 500,
    rows: 3,
  },
  pricing: {
    help: "Abonnement mensuel/annuel, essai gratuit, achat unique ou gratuit au lancement — montant si possible.",
    placeholder: "Ex. 9,99 €/mois après essai 7 jours, ou 49 €/an, ou gratuit 3 mois puis 6,99 €/mois…",
    examples: ["6,99 €/mois", "Gratuit + premium 4,99 €/mois", "Achat unique 19,99 €"],
    minLength: 4,
    maxLength: 400,
    rows: 2,
  },
};

export function migrateCreateAnswers(answers: CreateQuestionAnswers): CreateQuestionAnswers {
  const a: Record<string, string> = { ...answers };
  if (!a.audience?.trim()) {
    const legacy = [a.target_user, a.target_user_detail].filter(Boolean).join(" ");
    if (legacy.trim()) a.audience = legacy.trim();
  }
  if (!a.problem?.trim() && a.core_problem?.trim()) a.problem = a.core_problem.trim();
  if (!a.pricing?.trim()) {
    const legacy = [answers.pricing_confirm, answers.pricing_followup].filter(Boolean).join(" · ");
    if (legacy.trim()) a.pricing = legacy.trim();
  }
  if (!a.v1_features?.trim()) {
    const legacy = [a.v1_launch_ready, a.v1_launch_detail, a.first_session].filter(Boolean).join(" · ");
    if (legacy.trim()) a.v1_features = legacy.trim();
  }
  return a;
}

export function answerOf(answers: CreateQuestionAnswers, id: string): string {
  const v = (answers[id] ?? "").trim();
  return v === "__skipped__" ? "" : v;
}

export function isAnswerStep(step: ApplabCreateStepId): step is ApplabAnswerStepId {
  return APPLAB_ANSWER_STEP_ORDER.includes(step as ApplabAnswerStepId);
}

export function getQuestionField(step: ApplabAnswerStepId, ctx: CreateQuestionContext): CreateQuestionField {
  const base = FIELD_CONFIG[step];
  return { id: step, step, question: heroTitleForStep(step, ctx.name), ...base };
}

export function getStepInputProgress(step: ApplabCreateStepId): { current: number; total: number } | null {
  if (!isAnswerStep(step)) return null;
  const i = APPLAB_ANSWER_STEP_ORDER.indexOf(step);
  return { current: i + 1, total: APPLAB_ANSWER_STEP_ORDER.length };
}

export function canSubmitAnswerStep(step: ApplabAnswerStepId, value: string): boolean {
  const min = FIELD_CONFIG[step].minLength;
  return value.trim().length >= min;
}

export function canSubmitInputStep(step: ApplabCreateStepId, draft: {
  name: string;
  concept: string;
  clarifyingAnswers: CreateQuestionAnswers;
}): boolean {
  if (step === "name") return draft.name.trim().length >= 2;
  if (step === "concept") return draft.concept.trim().length >= 12;
  if (isAnswerStep(step)) return canSubmitAnswerStep(step, answerOf(draft.clarifyingAnswers, step));
  return false;
}

export function createQuestionsForApi(ctx: CreateQuestionContext): ApplabClarifyingQuestion[] {
  return APPLAB_ANSWER_STEP_ORDER.map((id) => {
    const field = getQuestionField(id, ctx);
    return { id, question: heroTitleForStep(id, ctx.name), hint: field.help };
  });
}

export function formatCreateAnswersBlock(ctx: CreateQuestionContext): string {
  return APPLAB_ANSWER_STEP_ORDER.map((id) => {
    const field = getQuestionField(id, ctx);
    const a = answerOf(ctx.answers, id);
    return `- [${id}] ${heroTitleForStep(id, ctx.name)}\n  Réponse: ${a || "(non renseigné)"}`;
  }).join("\n");
}

export function heroTitleForStep(step: ApplabCreateStepId, appName: string): string {
  const app = appName.trim() || "votre app";
  switch (step) {
    case "name":
      return "Créez votre prochaine app maintenant";
    case "concept":
      return `Décris le concept de ${app} en une phrase`;
    case "audience":
      return "C'est pour qui exactement";
    case "problem":
      return "Le problème principal que l'app résout";
    case "v1_features":
      return "Les fonctionnalités de la V1 (3 max)";
    case "pricing":
      return "Le prix des abonnements";
    case "synthesis":
      return `Bilan AppLAB — ${app}`;
    default:
      return "AppLAB Studio";
  }
}

export function buildUnderstandingFromCreateAnswers(
  name: string,
  concept: string,
  answers: CreateQuestionAnswers,
): ApplabConceptUnderstanding {
  const migrated = migrateCreateAnswers(answers);
  const audience = answerOf(migrated, "audience");
  const problem = answerOf(migrated, "problem");
  const v1 = answerOf(migrated, "v1_features");
  const pricing = answerOf(migrated, "pricing");

  const features = v1
    .split(/\n|[;,]|(?:\d+[\).])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3)
    .slice(0, 3);

  const searchQueries = [concept.slice(0, 48), problem.slice(0, 40), v1.slice(0, 40), ...features]
    .map((s) => s.trim())
    .filter((s) => s.length >= 4)
    .slice(0, 6);

  return {
    core_problem: problem || concept,
    target_user: audience || "À affiner",
    main_use_case: v1 || concept,
    niche: concept.slice(0, 280),
    specific_subject: concept,
    language_or_market: "App Store France — interface FR (décision Trackapp)",
    monetization: pricing || "Non précisé",
    key_features: features.length > 0 ? features : [v1.slice(0, 120) || concept.slice(0, 120)],
    not_competitors: [],
    search_queries: searchQueries,
    must_match: [],
  };
}

/** Compat legacy clarify-flow imports. */
export const buildUnderstandingFromClarifyFlow = buildUnderstandingFromCreateAnswers;
export const clarifyFlowQuestionsForApi = createQuestionsForApi;
export function getClarifyFlowProgress(ctx: CreateQuestionContext) {
  const done = APPLAB_ANSWER_STEP_ORDER.filter((id) =>
    canSubmitAnswerStep(id, answerOf(ctx.answers, id)),
  ).length;
  return { done, total: APPLAB_ANSWER_STEP_ORDER.length };
}
