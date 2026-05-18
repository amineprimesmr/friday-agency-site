/**
 * Specs & modèles éditoriaux pour TikTok (carrousel photo + vidéos courtes verticales).
 * Les limites plateforme évoluent — ajuster au besoin.
 */

export const TIKTOK_VERTICAL = {
  id: "tiktok_9_16",
  label: "TikTok vertical",
  aspectRatio: "9:16" as const,
  width: 1080,
  height: 1920,
  /** Zone titre / UI TikTok — garder texte lisible */
  safeZoneNote:
    "Marges ~120px haut et bas ; texte principal dans le « tiers central » pour éviter boutons et pseudo.",
  carouselMaxSlides: 35,
  carouselRecommendedSlides: { min: 5, ideal: 7, max: 12 },
  shortVideoLengthSec: { min: 15, ideal: 21, max: 60 },
} as const;

export type CarouselContentFormat = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  slideCount: { min: number; ideal: number; max: number };
  structure: string[];
  bestFor: string;
};

/** Formats pour carrousel photo (swipe) — storytelling vertical. */
export const CAROUSEL_CONTENT_FORMATS: CarouselContentFormat[] = [
  {
    id: "story_arc",
    label: "Arc narratif",
    emoji: "📖",
    description: "Hook choc → montée → révélation / leçon → CTA doux.",
    slideCount: { min: 5, ideal: 7, max: 10 },
    structure: ["Slide 1 — accroche (curiosité ou chiffre)", "2–3 — contexte / tension", "4–5 — pivot / insight", "Avant-dernier preuve ou typo humaine", "Dernier — CTA + question ouvre"],
    bestFor: "Témoignage, founder story, transformation.",
  },
  {
    id: "listicle_tips",
    label: "Liste de conseils",
    emoji: "🔢",
    description: "Une idée forte par slide, numéros énormes au centre.",
    slideCount: { min: 5, ideal: 6, max: 12 },
    structure: ["Slide 1 — promesse (« 5 trucs que… »)", "Slides 2–N — 1 conseil + sous-ligne courte", "Dernier — recap + sauvegarde / partage"],
    bestFor: "Business, restauration, productivity, avis tranchés.",
  },
  {
    id: "myth_reality",
    label: "Mythe vs réalité",
    emoji: "⚡",
    description: "Alternance brève : croyance commune → vérité terrain.",
    slideCount: { min: 4, ideal: 6, max: 10 },
    structure: ["Hook « On te ment sur… »", "Paire mythe / réalité × plusieurs", "Synthèse + CTA"],
    bestFor: "Expertise, niche technique, franchise / ops.",
  },
  {
    id: "before_after",
    label: "Avant / Après",
    emoji: "↔️",
    description: "Contraste visuel ou chiffré, sans sur-promesse.",
    slideCount: { min: 4, ideal: 5, max: 8 },
    structure: ["Situation avant (relatable)", "Ce qui n’allait pas", "Intervention (process)", "Après + preuve modeste", "CTA"],
    bestFor: "Rénovation, perf business, parcours client.",
  },
  {
    id: "tutorial_steps",
    label: "Tuto étapes",
    emoji: "🧰",
    description: "Pas-à-pas ultra clair, un geste par slide.",
    slideCount: { min: 5, ideal: 7, max: 14 },
    structure: ["Résultat final en teaser", "Prérequis", "Étapes 1…N", "Erreur fréquente", "CTA vers ressource ou vidéo longue"],
    bestFor: "Cuisine, outils, routines, onboarding.",
  },
  {
    id: "day_in_life",
    label: "Journée / coulisses",
    emoji: "🌅",
    description: "Tranches horaires ou lieux : authenticité > perfection.",
    slideCount: { min: 6, ideal: 8, max: 12 },
    structure: ["Matin / brief", "Milieu de journée / friction", "Peak moment", "Pause / human moment", "Bilan one-liner", "CTA"],
    bestFor: "Restauration, événements, créateurs solo.",
  },
  {
    id: "hot_take",
    label: "Hot take",
    emoji: "🔥",
    description: "Opinion tranchée, puis 2–3 arguments, conclusion invitant au débat.",
    slideCount: { min: 4, ideal: 5, max: 7 },
    structure: ["Prise de position en 1 phrase", "Pourquoi les gens se trompent", "Argument 1–2", "Nuance ou risque", "Question aux commentaires"],
    bestFor: "Débat d’industrie, tendances, « unpopular opinion ».",
  },
];

export type ShortVideoFormat = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  durationSec: { min: number; ideal: number; max: number };
  structure: string[];
  visualNotes: string;
};

/** Gabarits pour vidéos courtes (après validation concept) — toujours 9:16. */
export const SHORT_VIDEO_FORMATS: ShortVideoFormat[] = [
  {
    id: "talking_head_hook",
    label: "Face cam — hook verbal",
    emoji: "🎙️",
    description: "15–30 s : hook 2 s, corps 20 s, CTA 3 s. Caméra fixe ou légère.",
    durationSec: { min: 15, ideal: 25, max: 45 },
    structure: [
      "0–2 s : phrase d’accroche (curiosité / chiffre)",
      "2–20 s : 2–3 beats (problème → insight → preuve légère)",
      "Fin : CTA clair (commentaire / lien bio / épisode suivant)",
    ],
    visualNotes: "Éclairage key face, fond lisible, sous-titres brûlés pour silent feed.",
  },
  {
    id: "b_roll_narration",
    label: "Voix off + B-roll",
    emoji: "🎬",
    description: "30–45 s : narration sur plans lieu / mains / produit.",
    durationSec: { min: 20, ideal: 35, max: 60 },
    structure: ["Hook visuel + 1ère phrase VO", "Montage rythmé (0,5–2 s / plan)", "Révélation ou liste en VO", "Logo / CTA final"],
    visualNotes: "Variations de cadrage (wide → detail), mouvements lent smooth.",
  },
  {
    id: "text_on_glass",
    label: "Storytelling texte écran",
    emoji: "📝",
    description: "Peu de parole : phrases courtes synchro avec musique ou ambient.",
    durationSec: { min: 15, ideal: 21, max: 34 },
    structure: ["3–5 cartons max 8 mots", "1 twist au milieu", "CTA texte final"],
    visualNotes: "Typo grande, contrast élevé, safe zone mobile.",
  },
  {
    id: "split_screen_compare",
    label: "Split / comparatif",
    emoji: "⫿",
    description: "Deux colonnes ou avant/après en un take — idéal mythe vs réalité.",
    durationSec: { min: 12, ideal: 20, max: 40 },
    structure: ["Annonce du split", "Colonne A vs B synchrone", "Verdict one-liner"],
    visualNotes: "Garder visages / produits dans chaque moitié (safe center).",
  },
  {
    id: "trend_skeleton",
    label: "Son / trend (squelette)",
    emoji: "🎵",
    description: "Structure à caler sur un son tendance — beats marqués.",
    durationSec: { min: 12, ideal: 15, max: 30 },
    structure: ["Beat 1 — texte setup", "Beat 2 — twist", "Beat 3 — punchline + geste", "Fin — CTA ou loop"],
    visualNotes: "Laisser place au hook visuel dès la frame 1 (retention).",
  },
];

export function formatsSummaryForClaude(): string {
  const carousel = CAROUSEL_CONTENT_FORMATS.map(
    (f) =>
      `- **${f.id}** (${f.label}) : ${f.description} | slides idéal ${f.slideCount.ideal} | structure : ${f.structure.join(" → ")}`,
  ).join("\n");

  const video = SHORT_VIDEO_FORMATS.map(
    (f) =>
      `- **${f.id}** (${f.label}) : ${f.description} | durée idéale ~${f.durationSec.ideal}s | ${f.visualNotes}`,
  ).join("\n");

  return `## Spec TikTok vertical
- Format d’écran : **9:16** (${TIKTOK_VERTICAL.width}×${TIKTOK_VERTICAL.height}px recommandé).
- ${TIKTOK_VERTICAL.safeZoneNote}
- Carrousel : ${TIKTOK_VERTICAL.carouselRecommendedSlides.min}–${TIKTOK_VERTICAL.carouselRecommendedSlides.ideal} slides idéal (max plateforme ${TIKTOK_VERTICAL.carouselMaxSlides}).
- Vidéo courte : viser ${TIKTOK_VERTICAL.shortVideoLengthSec.min}–${TIKTOK_VERTICAL.shortVideoLengthSec.max}s.

## Formats carrousel (choisir un id ou hybrider)
${carousel}

## Formats vidéo courte (pour la suite production)
${video}
`;
}
