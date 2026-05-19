import type { AppDetail } from "@/lib/apple-charts";
import {
  buildAppBrandSlugs,
  GENERIC_APP_NAME_TOKENS,
  handleMatchesBrandSlug,
  isMonsterSocialHandle,
  primaryAppTitle,
} from "@/lib/official-brand-social-candidates";
import { instagramHandleFromUrl, instagramProfileUrlFromHandle } from "@/lib/instagram-organic-content";
import { tiktokHandleFromUrl, tiktokProfileUrlFromHandle } from "@/lib/tiktok-organic-content";

export type SocialAffirmPlatform = "instagram" | "tiktok";

export type SocialAffirmResult = Readonly<{
  ok: boolean;
  reason: string;
  bio: string | null;
  displayName: string | null;
}>;

const APIFY_TIMEOUT_MS = 35_000;

function actorApiId(actorId: string): string {
  return actorId.includes("/") ? actorId.replace("/", "~") : actorId;
}

function normalizeHaystack(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ");
}

function hostFromUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    return new URL(raw.trim()).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function appNameTokens(appName: string): string[] {
  return appName
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !GENERIC_APP_NAME_TOKENS.has(t));
}

function bioAffirmsOfficialApp(args: Readonly<{
  bio: string | null;
  profileUrls: readonly (string | null | undefined)[];
  displayName: string | null;
  app: AppDetail;
  officialSiteUrl: string | null;
  profileHandle: string | null;
  strictBrandSlug: boolean;
}>): SocialAffirmResult {
  const hay = normalizeHaystack(
    [args.bio, args.displayName, ...args.profileUrls].filter((v): v is string => Boolean(v?.trim())).join(" "),
  );
  if (!hay.trim()) {
    return { ok: false, reason: "profil sans bio exploitable", bio: args.bio, displayName: args.displayName };
  }

  const handleHay = args.profileHandle ? normalizeHaystack(args.profileHandle.replace(/^@/, "")) : "";
  const brandSlugs = buildAppBrandSlugs(args.app.name);

  if (args.strictBrandSlug) {
    if (!args.profileHandle || !handleMatchesBrandSlug(args.profileHandle, args.app.name)) {
      return {
        ok: false,
        reason: "handle hors liste autorisée (déduction nom d'app uniquement)",
        bio: args.bio,
        displayName: args.displayName,
      };
    }
    if (handleHay && hay.includes(handleHay)) {
      return {
        ok: true,
        reason: "bio ou nom cite le handle officiel attendu",
        bio: args.bio,
        displayName: args.displayName,
      };
    }
    if (brandSlugs.some((slug) => hay.includes(normalizeHaystack(slug)))) {
      return {
        ok: true,
        reason: "bio cite le slug marque de l'app",
        bio: args.bio,
        displayName: args.displayName,
      };
    }
    const titleHay = normalizeHaystack(primaryAppTitle(args.app.name));
    if (titleHay.length >= 4 && hay.includes(titleHay)) {
      return {
        ok: true,
        reason: "bio cite le nom commercial de l'app",
        bio: args.bio,
        displayName: args.displayName,
      };
    }
    return {
      ok: false,
      reason: "bio sans preuve claire pour ce handle (mode strict)",
      bio: args.bio,
      displayName: args.displayName,
    };
  }

  if (brandSlugs.some((slug) => hay.includes(normalizeHaystack(slug)))) {
    return {
      ok: true,
      reason: "bio ou nom de profil correspond au nom de l'app",
      bio: args.bio,
      displayName: args.displayName,
    };
  }

  const siteHost = hostFromUrl(args.officialSiteUrl);
  if (siteHost) {
    const domainRoot = siteHost.split(".")[0] ?? "";
    if (hay.includes(normalizeHaystack(siteHost)) || (domainRoot.length >= 4 && hay.includes(normalizeHaystack(domainRoot)))) {
      return { ok: true, reason: "bio ou lien externe cite le site officiel", bio: args.bio, displayName: args.displayName };
    }
  }

  if (args.app.trackViewUrl) {
    const storeHay = normalizeHaystack(args.app.trackViewUrl);
    if (hay.includes(storeHay) || hay.includes(normalizeHaystack(`apps.apple.com/app/id${args.app.id}`))) {
      return { ok: true, reason: "bio cite la fiche App Store", bio: args.bio, displayName: args.displayName };
    }
  }

  const tokens = appNameTokens(args.app.name);
  if (tokens.length >= 2) {
    const matched = tokens.filter((token) => hay.includes(normalizeHaystack(token)));
    if (matched.length >= 2) {
      return {
        ok: true,
        reason: `bio cite le nom de l'app (${matched.join(", ")})`,
        bio: args.bio,
        displayName: args.displayName,
      };
    }
  }

  const seller = args.app.sellerName?.trim() || args.app.artistName?.trim();
  if (seller) {
    const sellerTokens = appNameTokens(seller);
    const sellerMatched = sellerTokens.filter((t) => hay.includes(normalizeHaystack(t)));
    if (sellerTokens.length >= 2 && sellerMatched.length >= 2) {
      return { ok: true, reason: "bio cite l'éditeur officiel", bio: args.bio, displayName: args.displayName };
    }
  }

  return {
    ok: false,
    reason: "bio sans lien clair vers le site officiel, l'App Store ou le nom de l'app",
    bio: args.bio,
    displayName: args.displayName,
  };
}

async function runApifyActor(actorId: string, input: Record<string, unknown>): Promise<Record<string, unknown>[]> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return [];

  const endpoint = new URL(`https://api.apify.com/v2/acts/${actorApiId(actorId)}/run-sync-get-dataset-items`);
  endpoint.searchParams.set("token", token);
  endpoint.searchParams.set("clean", "true");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("timeout", "60");

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(APIFY_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
  } catch {
    return [];
  }
}

async function fetchInstagramProfileBrief(profileUrl: string, handle: string): Promise<{ bio: string | null; displayName: string | null; externalUrl: string | null } | null> {
  const actorId =
    process.env.APIFY_INSTAGRAM_ACTOR_ID?.trim() || "apify/instagram-profile-scraper";
  const cleanHandle = handle.replace(/^@/, "");
  const items = await runApifyActor(actorId, {
    usernames: [cleanHandle],
    resultsLimit: 1,
  });
  const row =
    items.find((item) => typeof item.username === "string") ??
    items.find((item) => typeof item.biography === "string") ??
    items[0];
  if (!row) return null;

  return {
    bio: typeof row.biography === "string" ? row.biography : typeof row.bio === "string" ? row.bio : null,
    displayName:
      typeof row.fullName === "string"
        ? row.fullName
        : typeof row.full_name === "string"
          ? row.full_name
          : null,
    externalUrl:
      typeof row.externalUrl === "string"
        ? row.externalUrl
        : typeof row.external_url === "string"
          ? row.external_url
          : typeof row.website === "string"
            ? row.website
            : null,
  };
}

function nestedRecordString(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function fetchTikTokProfileBrief(profileUrl: string, handle: string): Promise<{ bio: string | null; displayName: string | null } | null> {
  const actorId = process.env.APIFY_TIKTOK_ACTOR_ID?.trim() || "clockworks/tiktok-profile-scraper";
  const cleanHandle = handle.replace(/^@/, "");
  const items = await runApifyActor(actorId, {
    profiles: [cleanHandle],
    profileScrapeSections: ["videos"],
    resultsPerPage: 1,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
  });
  const row = items.find((item) => item.type === "profile") ?? items[0];
  if (!row) return null;

  const authorMeta = row.authorMeta;

  return {
    bio:
      nestedRecordString(row, "bio") ??
      nestedRecordString(row, "signature") ??
      nestedRecordString(authorMeta, "signature"),
    displayName:
      nestedRecordString(row, "nickname") ??
      nestedRecordString(row, "authorNickname") ??
      nestedRecordString(authorMeta, "nickName"),
  };
}

/** Vérifie qu'un profil social appartient bien à l'app (bio / lien externe). */
export async function affirmOfficialSocialProfile(
  platform: SocialAffirmPlatform,
  profileUrl: string,
  app: AppDetail,
  officialSiteUrl: string | null,
  options?: Readonly<{ strictBrandSlug?: boolean }>,
): Promise<SocialAffirmResult> {
  const strictBrandSlug = options?.strictBrandSlug ?? false;
  if (!process.env.APIFY_TOKEN?.trim()) {
    return {
      ok: false,
      reason: "vérification bio indisponible (APIFY_TOKEN manquant)",
      bio: null,
      displayName: null,
    };
  }

  const handleFromUrl =
    platform === "instagram" ? instagramHandleFromUrl(profileUrl) : tiktokHandleFromUrl(profileUrl);
  if (!handleFromUrl) {
    return { ok: false, reason: `URL ${platform} invalide`, bio: null, displayName: null };
  }
  if (isMonsterSocialHandle(handleFromUrl, app.name)) {
    return {
      ok: false,
      reason: "handle dérivé du titre complet (trop long)",
      bio: null,
      displayName: null,
    };
  }

  if (platform === "instagram") {
    const handle = handleFromUrl;
    const meta = await fetchInstagramProfileBrief(instagramProfileUrlFromHandle(handle), handle);
    if (!meta) {
      return { ok: false, reason: "impossible de lire le profil Instagram (Apify)", bio: null, displayName: null };
    }
    const verdict = bioAffirmsOfficialApp({
      bio: meta.bio,
      profileUrls: [meta.externalUrl, profileUrl],
      displayName: meta.displayName,
      app,
      officialSiteUrl,
      profileHandle: handle,
      strictBrandSlug,
    });
    return { ...verdict, displayName: meta.displayName };
  }

  const handle = handleFromUrl;
  const meta = await fetchTikTokProfileBrief(tiktokProfileUrlFromHandle(handle), handle);
  if (!meta) {
    return { ok: false, reason: "impossible de lire le profil TikTok (Apify)", bio: null, displayName: null };
  }
  const verdict = bioAffirmsOfficialApp({
    bio: meta.bio,
    profileUrls: [profileUrl],
    displayName: meta.displayName,
    app,
    officialSiteUrl,
    profileHandle: handle,
    strictBrandSlug,
  });
  return { ...verdict, displayName: meta.displayName };
}

export function isSocialBioAffirmConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN?.trim());
}
