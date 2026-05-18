/**
 * Détection heuristique des liens réseaux sociaux dans la fiche App Store
 * (description, notes de version). Pas de scraping externe — uniquement texte local.
 */

export type SocialNetworkId =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "x"
  | "youtube"
  | "snapchat"
  | "linkedin"
  | "pinterest"
  | "threads"
  | "bluesky"
  | "discord"
  | "reddit"
  | "twitch"
  | "medium";

export type DetectedSocialProfile = {
  id: SocialNetworkId;
  label: string;
  url: string;
  /** Handle ou fragment utile pour l’affichage */
  hint?: string;
};

const ORDER: SocialNetworkId[] = [
  "instagram",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "x",
  "snapchat",
  "linkedin",
  "reddit",
  "discord",
  "twitch",
  "pinterest",
  "bluesky",
  "medium",
];

function sortKey(p: DetectedSocialProfile): number {
  const i = ORDER.indexOf(p.id);
  return i === -1 ? 99 : i;
}

function stripTrailingPunctuation(href: string): string {
  return href.replace(/[.,;:!?)»\]]+$/u, "");
}

export function tryParseUrl(raw: string): URL | null {
  try {
    return new URL(stripTrailingPunctuation(raw.trim()));
  } catch {
    return null;
  }
}

function canonicalSocialKey(url: URL): string {
  return `${url.hostname.replace(/^www\./i, "")}${url.pathname}`.toLowerCase().replace(/\/$/, "");
}

function classify(url: URL): DetectedSocialProfile | null {
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const path = `${url.pathname}${url.search}`.replace(/\/+$/, "") || "/";

  if (host.endsWith("instagram.com") || host === "instagr.am") {
    const parts = path.split("/").filter(Boolean);
    const hint = parts[0] && !["p", "reel", "stories", "explore"].includes(parts[0]) ? `@${parts[0]}` : undefined;
    return { id: "instagram", label: "Instagram", url: url.toString(), hint };
  }

  if (host.endsWith("facebook.com") || host === "fb.com" || host.endsWith(".facebook.com")) {
    return { id: "facebook", label: "Facebook", url: url.toString(), hint: path !== "/" ? path : undefined };
  }

  if (host.endsWith("tiktok.com")) {
    const m = path.match(/@([^/?#]+)/);
    return { id: "tiktok", label: "TikTok", url: url.toString(), hint: m ? `@${m[1]}` : undefined };
  }

  if (host.endsWith("youtube.com") || host === "youtu.be") {
    const hint =
      host === "youtu.be"
        ? path.split("/").filter(Boolean)[0]
        : path.includes("/@")
          ? path.match(/\/@([^/?]+)/)?.[1]
          : path.match(/\/(channel|c|user)\/([^/?]+)/)?.[2];
    return { id: "youtube", label: "YouTube", url: url.toString(), hint: hint ? String(hint).slice(0, 40) : undefined };
  }

  if (host === "x.com" || host.endsWith("twitter.com")) {
    const parts = path.split("/").filter(Boolean);
    const user = parts[0] && !["intent", "share", "home", "search", "hashtag"].includes(parts[0]) ? parts[0] : undefined;
    return { id: "x", label: "X (Twitter)", url: url.toString(), hint: user ? `@${user}` : undefined };
  }

  if (host.endsWith("snapchat.com")) {
    const add = path.match(/\/add\/([^/?]+)/)?.[1];
    return { id: "snapchat", label: "Snapchat", url: url.toString(), hint: add ? `@${add}` : undefined };
  }

  if (host.endsWith("linkedin.com")) {
    return { id: "linkedin", label: "LinkedIn", url: url.toString() };
  }

  if (host.endsWith("pinterest.com") || host.endsWith("pin.it")) {
    return { id: "pinterest", label: "Pinterest", url: url.toString() };
  }

  if (host === "threads.net" || host.endsWith(".threads.net")) {
    let hint: string | undefined;
    const mAt = path.match(/@([^/?#]+)/);
    if (mAt) hint = `@${mAt[1]}`;
    else {
      const seg = path.split("/").filter(Boolean)[0];
      if (seg && !["about", "legal", "login"].includes(seg)) {
        hint = seg.startsWith("@") ? seg : `@${seg}`;
      }
    }
    return { id: "threads", label: "Threads", url: url.toString(), hint };
  }

  if (host === "bsky.app" || host.endsWith(".bsky.app")) {
    const m = path.match(/\/profile\/([^/?#]+)/);
    return { id: "bluesky", label: "Bluesky", url: url.toString(), hint: m?.[1] ? `@${m[1].replace(/^@/, "")}` : undefined };
  }

  if (host === "discord.gg" || host.endsWith("discord.com")) {
    return { id: "discord", label: "Discord", url: url.toString(), hint: path !== "/" ? path : undefined };
  }

  if (host.endsWith("reddit.com")) {
    const parts = path.split("/").filter(Boolean);
    const sub = parts[0] === "r" && parts[1] ? `r/${parts[1]}` : undefined;
    return { id: "reddit", label: "Reddit", url: url.toString(), hint: sub };
  }

  if (host.endsWith("twitch.tv")) {
    const parts = path.split("/").filter(Boolean);
    const user = parts[0] && !["directory", "videos", "downloads", "settings"].includes(parts[0]) ? parts[0] : undefined;
    return { id: "twitch", label: "Twitch", url: url.toString(), hint: user };
  }

  if (host.endsWith("medium.com") || host === "medium.com" || host.endsWith(".medium.com")) {
    return { id: "medium", label: "Medium", url: url.toString(), hint: path !== "/" ? path : undefined };
  }

  return null;
}

/** Profil détecté à partir d’une URL complète (utile pour fusionner des liens OpenAI). */
export function detectProfileFromUrl(urlString: string): DetectedSocialProfile | null {
  const url = tryParseUrl(urlString);
  if (!url) return null;
  return classify(url);
}

/** Fusionne des profils détectés (dédoublonnage par hôte + chemin). */
export function mergeSocialProfiles(
  base: DetectedSocialProfile[],
  extras: DetectedSocialProfile[],
): DetectedSocialProfile[] {
  function dedupeKey(p: DetectedSocialProfile): string {
    const u = tryParseUrl(p.url);
    if (!u) return `${p.id}|${p.url.toLowerCase()}`;
    return `${p.id}|${canonicalSocialKey(u)}`;
  }

  const seen = new Set(base.map(dedupeKey));
  const out = [...base];
  for (const p of extras) {
    const k = dedupeKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  out.sort((a, b) => sortKey(a) - sortKey(b) || a.label.localeCompare(b.label, "fr"));
  return out;
}

/**
 * Extrait les URLs http(s) du texte et les classe par réseau (dédoublonnage par URL canonique).
 */
export function extractSocialProfiles(...textChunks: string[]): DetectedSocialProfile[] {
  const combined = textChunks.filter(Boolean).join("\n");
  const urlRegex = /https?:\/\/[^\s<>"')\]]+/gi;
  const seen = new Set<string>();
  const out: DetectedSocialProfile[] = [];

  for (const m of combined.matchAll(urlRegex)) {
    const raw = m[0];
    const url = tryParseUrl(raw);
    if (!url) continue;
    const key = `${url.hostname.replace(/^www\./i, "")}${url.pathname}`.toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) continue;

    const profile = classify(url);
    if (!profile) continue;

    seen.add(key);
    out.push(profile);
  }

  out.sort((a, b) => sortKey(a) - sortKey(b) || a.label.localeCompare(b.label, "fr"));
  return out;
}
