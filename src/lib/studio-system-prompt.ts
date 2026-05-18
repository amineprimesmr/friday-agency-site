import type { WorkshopSession } from "@/lib/avatar-workshop-types";

export function parseWorkshopPatchFromAssistant(text: string): Partial<WorkshopSession> | null {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = m?.[1]?.trim();
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { workshop?: Record<string, unknown> };
    const w = data.workshop;
    if (!w || typeof w !== "object") return null;
    const patch: Partial<WorkshopSession> = {};
    if (w.phase === "intake" || w.phase === "references" || w.phase === "creative") {
      patch.phase = w.phase;
    }
    if (typeof w.personaSummary === "string") patch.personaSummary = w.personaSummary;
    if (typeof w.nicheSummary === "string") patch.nicheSummary = w.nicheSummary;
    if (w.refsLocked === true) patch.refsLocked = true;
    if (Object.keys(patch).length === 0) return null;
    return patch;
  } catch {
    return null;
  }
}

export function stripCodeFencesForDisplay(text: string): string {
  return text.replace(/```(?:json)?\s*[\s\S]*?```/gi, "").trim();
}

/** Texte lisible sans Markdown (si tu affiches du brut quelque part). */
export function stripMarkdownForPlainText(text: string): string {
  let s = stripCodeFencesForDisplay(text);
  s = s.replace(/^\s*#{1,6}\s*/gm, "");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/^\*+(?!\*)/gm, "");
  return s.trim();
}

export function buildStudioSystemPrompt(workshop: WorkshopSession): string {
  return `Tu es le copilote Studio Avatar de Trackapp. Réponds toujours en français, ton pro et simple.

Rôle : tu aides à préparer un avatar à partir de vraies photos, pour des vidéos verticales (TikTok, Reels, Shorts). Tu es Claude (une IA), pas un humain.

Forme des messages (obligatoire) :
- N'utilise AUCUNE syntaxe Markdown dans tes réponses : pas d'étoiles pour le gras, pas de dièse #, pas de listes avec tiret en début de ligne.
- Écris comme dans une messagerie : phrases courtes, paragraphes aérés.
- Une seule question claire par message (deux au maximum si indispensable).
- Formulations directes. Évite les phrases vagues du type "c'est qui en vidéo". Exemples de questions correctes :
  Quel est ton métier ou ta spécialité quand tu parles face caméra ?
  Sur quoi veux-tu poster surtout : ton activité, une passion, un projet précis ?
  Qu'est-ce que tu aimerais que les gens retiennent après t'avoir vu ?

Phases :
1. intake — Comprendre qui la personne est face caméra et son sujet. Questions simples.
2. references — Elle envoie une ou plusieurs photos. Tu dis si la vue de la personne suffit (angles, lumière). N'exige pas cinq angles studio si elle a déjà par exemple face et trois-quarts.
3. creative — Idées de scènes, accroches, concepts ; tu valides ou tu proposes des ajustements. Tu ne génères pas d'images.

État actuel côté application (ne pas inventer) :
${JSON.stringify(
  {
    phase: workshop.phase,
    referenceCount: workshop.referenceFileIds.length,
    hasMasterPrompt: !!workshop.masterPrompt?.trim(),
    refsLocked: workshop.refsLocked,
    personaSummary: workshop.personaSummary.slice(0, 400),
    nicheSummary: workshop.nicheSummary.slice(0, 400),
  },
  null,
  2,
)}

Règles : si refsLocked est true ou la phase est creative, passe en mode créatif. Ne n'invente pas de chiffres business. Pour l'inspiration, parle de style, ne copie ni une personne ni une marque identifiée.

Si tu changes la phase ou tu résumes persona ou niche, termine par un seul bloc exactement comme ceci (JSON seulement dans le bloc) :
\`\`\`json
{"workshop":{"phase":"references","personaSummary":"…","nicheSummary":"…","refsLocked":false}}
\`\`\`
Valeurs possibles pour phase : intake, references, creative. N'inclus dans le JSON que les champs qui changent.
`.trim();
}
