/** @deprecated Utiliser `@/lib/trackapp-applab-create/create-questions`. */
export {
  type CreateQuestionAnswers as ClarifyFlowAnswers,
  type CreateQuestionContext as ClarifyFlowContext,
  type CreateQuestionField as ClarifyFlowQuestion,
  buildUnderstandingFromClarifyFlow,
  buildUnderstandingFromCreateAnswers,
  clarifyFlowQuestionsForApi,
  createQuestionsForApi,
  formatCreateAnswersBlock as formatClarifyFlowAnswersBlock,
  getClarifyFlowProgress,
  migrateCreateAnswers,
  answerOf,
} from "@/lib/trackapp-applab-create/create-questions";

import {
  APPLAB_ANSWER_STEP_ORDER,
  answerOf,
  canSubmitAnswerStep,
  type CreateQuestionContext,
  type CreateQuestionField,
  getQuestionField,
} from "@/lib/trackapp-applab-create/create-questions";

export function getNextClarifyFlowQuestion(ctx: CreateQuestionContext): CreateQuestionField | null {
  for (const id of APPLAB_ANSWER_STEP_ORDER) {
    if (!canSubmitAnswerStep(id, answerOf(ctx.answers, id))) {
      return getQuestionField(id, ctx);
    }
  }
  return null;
}

export function canSubmitClarifyAnswer(question: CreateQuestionField, value: string): boolean {
  return value.trim().length >= question.minLength;
}

export function getLastAnsweredClarifyId(ctx: CreateQuestionContext): string | null {
  const answered = APPLAB_ANSWER_STEP_ORDER.filter((id) =>
    canSubmitAnswerStep(id, answerOf(ctx.answers, id)),
  );
  return answered.length > 0 ? answered[answered.length - 1]! : null;
}
