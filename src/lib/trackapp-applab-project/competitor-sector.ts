import type { SearchResultWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";
import type { ApplabConceptUnderstanding } from "@/lib/trackapp-applab-project/types";

const SECTOR_RULES: readonly {
  pattern: RegExp;
  categories: readonly string[];
  keywords: readonly string[];
}[] = [
  {
    pattern: /arabe|langue|alphabet|vocabulaire|grammaire|duolingo|appren|leçon|cours|education|scolaire|enfant/i,
    categories: ["Education", "Référence", "Books"],
    keywords: ["arabe", "arabic", "langue", "language", "alphabet", "learn", "apprendre", "cours", "lecon"],
  },
  {
    pattern: /sport|fitness|running|course|muscu|coach|entrainement|entraînement|yoga|marche|velo|vélo/i,
    categories: ["Health & Fitness", "Sports"],
    keywords: ["running", "sport", "fitness", "coach", "workout", "course", "marathon"],
  },
  {
    pattern: /nutrition|calorie|repas|regime|régime|poids|macro|jeune|fasting|food/i,
    categories: ["Health & Fitness", "Food & Drink", "Medical"],
    keywords: ["calorie", "nutrition", "repas", "diet", "food", "macro"],
  },
  {
    pattern: /productiv|todo|habitude|focus|pomodoro|organis|planning|agenda|note/i,
    categories: ["Productivity", "Business", "Utilities"],
    keywords: ["todo", "habit", "focus", "productivity", "planner", "organize"],
  },
  {
    pattern: /finance|budget|depense|dépense|invest|crypto|banque|argent|epargne|épargne/i,
    categories: ["Finance", "Business"],
    keywords: ["budget", "finance", "money", "invest", "bank", "expense"],
  },
  {
    pattern: /medit|sommeil|sleep|mental|stress|bien.?etre|bien.?être|mindful/i,
    categories: ["Health & Fitness", "Medical", "Lifestyle"],
    keywords: ["meditation", "sleep", "mindful", "stress", "wellness"],
  },
  {
    pattern: /photo|video|vidéo|montage|camera|caméra|edit|filtre/i,
    categories: ["Photo & Video"],
    keywords: ["photo", "video", "camera", "edit", "filter"],
  },
  {
    pattern: /social|rencontre|dating|chat|message|communaut/i,
    categories: ["Social Networking", "Lifestyle"],
    keywords: ["social", "chat", "dating", "message", "community"],
  },
];

function normalizeText(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildConceptCorpus(
  concept: string,
  understanding: ApplabConceptUnderstanding,
): string {
  return normalizeText(
    [
      concept,
      understanding.niche,
      understanding.core_problem,
      understanding.main_use_case,
      understanding.specific_subject,
      ...understanding.key_features,
      ...understanding.must_match,
    ].join(" "),
  );
}

export type CompetitorSectorProfile = Readonly<{
  categories: readonly string[];
  keywords: readonly string[];
}>;

export function inferCompetitorSector(
  concept: string,
  understanding: ApplabConceptUnderstanding,
): CompetitorSectorProfile {
  const corpus = buildConceptCorpus(concept, understanding);
  const categories = new Set<string>();
  const keywords = new Set<string>();

  for (const rule of SECTOR_RULES) {
    if (rule.pattern.test(corpus)) {
      for (const c of rule.categories) categories.add(c);
      for (const k of rule.keywords) keywords.add(k);
    }
  }

  for (const token of corpus.split(/\s+/).filter((t) => t.length >= 4)) {
    keywords.add(token);
  }

  return {
    categories: [...categories],
    keywords: [...keywords],
  };
}

export function categoryMatchesSector(category: string, sector: CompetitorSectorProfile): boolean {
  if (sector.categories.length === 0) return true;
  const cat = normalizeText(category);
  return sector.categories.some((c) => cat.includes(normalizeText(c)) || normalizeText(c).includes(cat));
}

export function appMatchesSectorKeywords(
  app: Pick<SearchResultWithTrackappMetrics, "name" | "description" | "category">,
  sector: CompetitorSectorProfile,
): boolean {
  if (sector.keywords.length === 0) return true;
  const hay = normalizeText(`${app.name} ${app.description ?? ""} ${app.category ?? ""}`);
  return sector.keywords.some((k) => k.length >= 4 && hay.includes(k));
}

export function isProjectBrandHomonym(
  app: Pick<SearchResultWithTrackappMetrics, "name" | "category">,
  projectName: string,
  concept: string,
  understanding: ApplabConceptUnderstanding,
  sector: CompetitorSectorProfile,
): boolean {
  const brand = normalizeText(projectName.split(/[:–\-|]/)[0] ?? projectName);
  if (brand.length < 3) return false;

  const appBrand = normalizeText(app.name.split(/[:–\-|]/)[0] ?? app.name);
  const nameCollision =
    appBrand === brand || appBrand.startsWith(`${brand} `) || appBrand.startsWith(brand);

  if (!nameCollision) return false;

  const corpus = buildConceptCorpus(concept, understanding);
  const appHay = normalizeText(app.name);
  const conceptTokens = corpus.split(/\s+/).filter((t) => t.length >= 4);
  const conceptOverlap = conceptTokens.filter((t) => appHay.includes(t)).length;

  if (conceptOverlap >= 2) return false;

  if (sector.categories.length > 0) {
    return !categoryMatchesSector(app.category ?? "", sector);
  }

  return conceptOverlap === 0;
}

/** Le nom de projet seul ne doit pas être une requête App Store (faux positifs homonymes). */
export function sanitizeCompetitorSearchQueries(
  queries: readonly string[],
  projectName: string,
  concept: string,
): string[] {
  const brand = normalizeText(projectName);
  const conceptNorm = normalizeText(concept);

  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))].filter((q) => {
    const n = normalizeText(q);
    if (n.length < 3) return false;
    if (brand.length >= 3 && n === brand) return false;
    if (brand.length >= 3 && n.split(/\s+/).length === 1 && n === brand) return false;
    if (conceptNorm.includes(n) || n.includes(conceptNorm.slice(0, Math.min(conceptNorm.length, 24)))) {
      return true;
    }
    return n.split(/\s+/).length >= 2 || n.length >= 5;
  });
}

export function revenueSortKey(sortRevenueUsd: number, revenueDisplay: string): number {
  if (sortRevenueUsd > 50) return sortRevenueUsd;
  if (revenueDisplay.trim() === "<100€") return 50;
  return 0;
}
