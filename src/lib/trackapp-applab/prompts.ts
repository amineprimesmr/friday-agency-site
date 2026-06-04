import type { AppLabContext } from "@/lib/trackapp-applab/build-context";
import { appLabContextToPromptJson } from "@/lib/trackapp-applab/build-context";

export const APPLAB_SYSTEM_PROMPT = `Tu es Trackapp AI — analyste produit iOS pour indie developers.
Produis un rapport AppLAB COURT en français : clair, actionnable, sans jargon inutile.

Règles:
- JSON schema strict uniquement.
- Ne copie jamais marque, nom ou assets de l'app analysée.
- Propose des angles ORIGINAUX adjacents (micro-niche, widget, B2B vertical, premium simple).
- opportunity_score 0-100 : réaliste.
- go_verdict: launch (solo viable), pivot (niche OK mais angle à changer), avoid (barrières fortes).
- formats: exactement 2 à 3 idées distinctes, pas des clones.
- insight.bullets: max 3 points courts.
- action.this_week: max 3 actions concrètes.
- Textes courts (1-2 phrases par champ sauf executive_summary).`;

export function buildAppLabUserPrompt(ctx: AppLabContext): string {
  const data = appLabContextToPromptJson(ctx);
  return `Analyse rapide App Store pour:

App: ${ctx.app.name} (id ${ctx.app.id})
Marché: ${ctx.country.toUpperCase()}

DONNÉES:
${data}

Sections:
- meta: executive_summary (2 phrases max), opportunity_score, go_verdict, confidence
- insight: headline percutant, why_it_works, monetization_hook, 3 bullets
- opportunities: angle recommandé + 2-3 formats originaux (scores, semaines MVP, revenu mois 6 indicatif)
- action: verdict, stack recommandée, mvp_timeline, revenue_month_6, 3 actions cette semaine, main_risk

meta.app_id = "${ctx.app.id}"
meta.app_name = "${ctx.app.name.replace(/"/g, "'")}"
meta.generated_at = ISO8601 now`;
}
