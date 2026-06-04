import type { AppDetail } from "@/lib/apple-charts";
import type { SocialAffirmPlatform } from "@/lib/official-brand-social-affirm";

const NAME_STOP_WORDS = new Set([
  "app",
  "the",
  "and",
  "for",
  "pro",
  "plus",
  "lite",
  "ios",
  "avec",
  "pour",
  "your",
  "de",
  "du",
  "la",
  "le",
  "les",
  "des",
  "une",
  "par",
]);

/** Mots trop génériques pour valider seuls (évite faux positifs bio « video »). */
export const GENERIC_APP_NAME_TOKENS = new Set([
  "video",
  "photo",
  "health",
  "fitness",
  "life",
  "daily",
  "tracker",
  "maker",
  "editor",
  "studio",
  "generator",
  "generateur",
]);

/** Handles avec point — uniquement si vérifiés manuellement (ne pas dériver du domaine). */
const EXPLICIT_DOTTED_HANDLES = new Set(["blow.up.studio", "blowup.app", "depuffai.app"]);

const MAX_HEURISTIC_HANDLE_LEN = 20;

function normalizeToken(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function nameParts(appName: string): string[] {
  return appName
    .split(/[^a-z0-9]+/i)
    .map(normalizeToken)
    .filter((t) => t.length >= 2);
}

/** Titre court avant sous-titre (« AI Video - Générateur… » → « AI Video »). */
export function primaryAppTitle(appName: string): string {
  const trimmed = appName.trim();
  const cut = trimmed.split(/\s[–—\-|:•]\s|:\s+/)[0]?.trim();
  return cut || trimmed;
}

/** Slugs dérivés du nom court (« AI Video » → aivideo, aivideoapp). */
export function buildAppBrandSlugs(appName: string): string[] {
  const title = primaryAppTitle(appName);
  const parts = nameParts(title).filter((p) => !NAME_STOP_WORDS.has(p));
  const slugs = new Set<string>();

  if (parts.includes("ai")) {
    const afterAi = parts.filter((p) => p !== "ai").slice(0, 2);
    if (afterAi.length > 0) {
      const core = `ai${afterAi.join("")}`;
      if (core.length >= 4 && core.length <= MAX_HEURISTIC_HANDLE_LEN) {
        slugs.add(core);
        slugs.add(`${core}app`);
      }
    }
  }

  if (parts.length >= 2) {
    const pair = parts.slice(0, 2).join("");
    if (pair.length >= 4 && pair.length <= MAX_HEURISTIC_HANDLE_LEN) {
      slugs.add(pair);
      slugs.add(`${pair}app`);
    }
  }

  if (parts.length === 1 && parts[0]!.length >= 4) {
    slugs.add(parts[0]!);
    slugs.add(`${parts[0]}app`);
  }

  /** Token principal (« Duolingo : Cours… » → duolingo) — handle le plus courant en social. */
  const lead = parts.find((p) => p.length >= 4 && !NAME_STOP_WORDS.has(p));
  if (lead) {
    slugs.add(lead);
    slugs.add(`${lead}app`);
  }

  return [...slugs];
}

export function handleMatchesBrandSlug(handle: string, appName: string): boolean {
  const clean = handle.replace(/^@/, "").toLowerCase();
  const slugs = buildAppBrandSlugs(appName);
  return slugs.some((s) => clean === s);
}

export function isHeuristicHandlePlausible(handle: string, appName: string): boolean {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (clean.length < 3) return false;
  if (clean.includes(".")) {
    return EXPLICIT_DOTTED_HANDLES.has(clean);
  }
  return handleMatchesBrandSlug(clean, appName);
}

/** Handles dérivés du titre complet — à rejeter avant Apify. */
export function isMonsterSocialHandle(handle: string, appName: string): boolean {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (clean.length <= MAX_HEURISTIC_HANDLE_LEN) return false;
  return !handleMatchesBrandSlug(clean, appName);
}

/** Handles testés en heuristique : slugs nom d'app + liste blanche éditoriale uniquement. */
export function buildHeuristicSocialHandles(app: AppDetail): string[] {
  const handles = new Set<string>();

  for (const slug of buildAppBrandSlugs(app.name)) {
    if (slug.length <= MAX_HEURISTIC_HANDLE_LEN) {
      handles.add(slug);
    }
  }

  const name = app.name.toLowerCase();
  if (/blow\s*up|blowup/i.test(name)) {
    for (const h of ["blowup", "blowup.app", "blow.up.studio"] as const) {
      handles.add(h);
    }
  }
  if (/depuff/i.test(name)) {
    for (const h of ["depuffai", "depuffai.app"] as const) {
      handles.add(h);
    }
  }

  return [...handles].sort((a, b) => handlePriority(b, app.name) - handlePriority(a, app.name));
}

function handlePriority(handle: string, appName: string): number {
  const slugs = buildAppBrandSlugs(appName).map((s) => s.toLowerCase());
  let score = 0;
  if (slugs.includes(handle)) score += 12;
  if (handle.endsWith("app")) score += 4;
  if (handle.length <= 12) score += 2;
  return score;
}

export function heuristicProfileUrl(platform: SocialAffirmPlatform, handle: string): string {
  const clean = handle.replace(/^@/, "");
  if (platform === "instagram") {
    return `https://www.instagram.com/${encodeURIComponent(clean)}/`;
  }
  return `https://www.tiktok.com/@${encodeURIComponent(clean)}`;
}

export function buildHeuristicSocialCandidates(
  app: AppDetail,
): ReadonlyArray<{ platform: SocialAffirmPlatform; url: string }> {
  const out: { platform: SocialAffirmPlatform; url: string }[] = [];
  const seen = new Set<string>();

  for (const handle of buildHeuristicSocialHandles(app)) {
    for (const platform of ["instagram", "tiktok"] as const) {
      const url = heuristicProfileUrl(platform, handle);
      const key = `${platform}:${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ platform, url });
    }
  }
  return out;
}
