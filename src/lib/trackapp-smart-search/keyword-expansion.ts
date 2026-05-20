/** Expansion sémantique légère pour requêtes courtes (sport, fitness, tiktok…). */

const EXPANSIONS: Readonly<Record<string, readonly string[]>> = {
  sport: ["fitness", "workout", "running", "gym", "health"],
  sports: ["fitness", "workout", "running"],
  fitness: ["workout", "gym", "health", "sport", "yoga"],
  gym: ["fitness", "workout", "health"],
  workout: ["fitness", "gym", "health"],
  running: ["fitness", "sport", "health"],
  yoga: ["fitness", "meditation", "wellness"],
  santé: ["health", "fitness", "wellness"],
  sante: ["health", "fitness", "wellness"],
  health: ["fitness", "wellness", "meditation"],
  méditation: ["meditation", "mindfulness", "wellness"],
  meditation: ["mindfulness", "wellness", "sleep"],
  sommeil: ["sleep", "wellness", "meditation"],
  sleep: ["wellness", "meditation"],
  finance: ["budget", "money", "investing", "banking"],
  argent: ["budget", "finance", "money"],
  budget: ["finance", "money"],
  crypto: ["bitcoin", "trading", "wallet"],
  trading: ["investing", "stocks", "finance"],
  dating: ["relationship", "love", "meet"],
  rencontre: ["dating", "relationship"],
  photo: ["photo editor", "camera", "filters"],
  vidéo: ["video editor", "video"],
  video: ["video editor", "creator"],
  tiktok: ["social media", "creator", "content", "short video"],
  instagram: ["social media", "creator", "content"],
  creator: ["content", "social media", "tiktok"],
  créateur: ["content", "social media"],
  productivity: ["productivity", "notes", "tasks"],
  productivité: ["productivity", "tasks", "notes"],
  notes: ["notes", "productivity", "journal"],
  education: ["learning", "language", "study"],
  éducation: ["learning", "language"],
  language: ["learn language", "vocabulary"],
  langue: ["language", "learn"],
  kids: ["kids", "children", "family"],
  enfants: ["kids", "children"],
  game: ["games", "puzzle"],
  jeux: ["games", "puzzle"],
  food: ["food", "recipe", "nutrition"],
  cuisine: ["recipe", "food"],
  recette: ["recipe", "food"],
};

export function expandSearchQueries(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];

  const terms = new Set<string>([q]);

  const words = q.split(/\s+/).filter((w) => w.length >= 2);
  for (const w of words) {
    terms.add(w);
    const extra = EXPANSIONS[w];
    if (extra) extra.forEach((t) => terms.add(t));
  }

  if (words.length === 1) {
    const extra = EXPANSIONS[q];
    if (extra) extra.forEach((t) => terms.add(t));
  }

  return [...terms].slice(0, 6);
}

export function isGenericDiscoveryQuery(raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return false;
  if (q.length <= 14 && !q.includes("app")) return true;
  const words = q.split(/\s+/);
  return words.length <= 2 && words.every((w) => EXPANSIONS[w] !== undefined || w.length <= 8);
}
