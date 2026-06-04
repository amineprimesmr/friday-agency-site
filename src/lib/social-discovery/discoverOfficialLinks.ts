import type { AppDetail } from "@/lib/apple-charts";
import {
  OFFICIAL_SOCIAL_OVERRIDE_PLATFORMS,
  VERIFIED_OFFICIAL_SOCIAL_OVERRIDES,
} from "@/lib/official-brand-social-overrides";
import { buildHeuristicSocialCandidates } from "@/lib/official-brand-social-candidates";
import { buildMetaAdsLibraryUrl } from "@/lib/social-discovery/buildMetaAdsLibraryUrl";
import {
  brandTokensForApp,
  socialUrlMatchesBrandTokens,
  socialUrlStrictBrandMatch,
} from "@/lib/social-discovery/brand-social-heuristic";
import { findAppStoreFromApp } from "@/lib/social-discovery/findAppStore";
import {
  openAiCandidates,
  pickOfficialWebsiteFromAppStore,
  validateWebsiteCandidate,
} from "@/lib/social-discovery/findOfficialWebsite";
import { validateGooglePlayCandidate } from "@/lib/social-discovery/findGooglePlay";
import { findMetaPageIdFromFacebookUrl } from "@/lib/social-discovery/findMetaPageId";
import { isPlausibleMetaPageId } from "@/lib/meta-page-id-plausible";
import { resolveFacebookPageNode } from "@/lib/meta-page-resolve";
import { openaiValidateSocialCandidates } from "@/lib/social-discovery/openaiSocialValidator";
import { runOpenAiWebDiscovery } from "@/lib/social-discovery/openaiWebDiscovery";
import {
  computeFinalRankScore,
  pickBestRankedOutcome,
  sortCandidatesBySourcePriority,
  type RankedSocialOutcome,
} from "@/lib/social-discovery/rankSocialCandidates";
import { scrapeOfficialWebsite } from "@/lib/social-discovery/scrapeOfficialWebsite";
import {
  handleMatchesWebsiteCluster,
  socialHandleFromUrl,
} from "@/lib/social-discovery/social-handle-utils";
import { evaluateSocialProfileAuthority } from "@/lib/social-discovery/socialProfileAuthority";
import type {
  EvidenceKind,
  LinkCandidate,
  OfficialLinksDiscoveryResult,
  RejectedCandidate,
  SocialPlatform,
  ValidatedLink,
} from "@/lib/social-discovery/types";
import { validateLinkCandidate } from "@/lib/social-discovery/validateSocialLink";

const SOCIAL_PLATFORMS: Array<
  Exclude<SocialPlatform, "website" | "app_store" | "google_play" | "meta_ads_library">
> = ["instagram", "tiktok", "x", "youtube", "facebook", "linkedin", "threads"];

function pushCandidate(pool: Map<SocialPlatform, LinkCandidate[]>, candidate: LinkCandidate): void {
  if (!SOCIAL_PLATFORMS.includes(candidate.platform as (typeof SOCIAL_PLATFORMS)[number])) return;
  const list = pool.get(candidate.platform) ?? [];
  if (list.some((c) => c.url === candidate.url)) return;
  list.push(candidate);
  pool.set(candidate.platform, list);
}

function buildWebsiteHandleCluster(
  scrapeCandidates: readonly LinkCandidate[],
): string[] {
  const handles = new Set<string>();
  for (const c of scrapeCandidates) {
    if (!c.evidence.includes("official_website_link")) continue;
    const h = socialHandleFromUrl(c.platform, c.url);
    if (h) handles.add(h);
  }
  return [...handles];
}

async function resolveBestSocialForPlatform(
  app: AppDetail,
  platform: (typeof SOCIAL_PLATFORMS)[number],
  candidates: readonly LinkCandidate[],
  validateOpts: Readonly<{
    openAiSources: string[];
    officialWebsiteUrl: string | null;
    brandTokens: readonly string[];
  }>,
  websiteHandleCluster: readonly string[],
): Promise<{ validated: ValidatedLink | null; rejected: RejectedCandidate[] }> {
  const rejected: RejectedCandidate[] = [];
  const ranked: RankedSocialOutcome[] = [];

  for (const candidate of sortCandidatesBySourcePriority(candidates)) {
    const result = await validateLinkCandidate(app, candidate, validateOpts);
    if (!result.validated) {
      if (result.rejected) rejected.push(result.rejected);
      continue;
    }

    const fromOfficialWebsite = candidate.evidence.includes("official_website_link");
    const handle = socialHandleFromUrl(platform, candidate.url);
    const handleStrictMatch = socialUrlStrictBrandMatch(candidate.url, app.name);
    const crossNetworkMatch = handleMatchesWebsiteCluster(handle, websiteHandleCluster);

    if (
      !fromOfficialWebsite &&
      !handleStrictMatch &&
      !crossNetworkMatch &&
      websiteHandleCluster.length > 0 &&
      (platform === "instagram" || platform === "tiktok" || platform === "x")
    ) {
      rejected.push({
        url: candidate.url,
        platform,
        reason: "handle incohérent avec les comptes du site officiel",
      });
      continue;
    }

    let bioAffirmed = false;
    let followers: number | null = null;
    let verified: boolean | null = null;

    if (platform === "instagram" || platform === "tiktok") {
      const authority = await evaluateSocialProfileAuthority(
        platform,
        candidate.url,
        app,
        validateOpts.officialWebsiteUrl,
        {
          fromOfficialWebsite,
          websiteHandleCluster,
          openAiStructured: candidate.evidence.includes("openai_structured_output"),
          manualSeed: candidate.evidence.includes("manual_whitelist"),
          brandHeuristic: candidate.evidence.includes("brand_slug_heuristic"),
        },
      );
      followers = authority.followers;
      verified = authority.verified;
      bioAffirmed = authority.bioAffirmed;

      if (!authority.pass) {
        rejected.push({
          url: candidate.url,
          platform,
          reason: authority.reason,
        });
        continue;
      }
    }

    const evidence = [...candidate.evidence] as EvidenceKind[];
    if (bioAffirmed && !evidence.includes("bio_profile_affirmed")) {
      evidence.push("bio_profile_affirmed");
    }

    const validated: ValidatedLink = {
      ...result.validated,
      confidence: computeFinalRankScore(result.validated, { ...candidate, evidence }, {
        bioAffirmed,
        followers,
        verified,
        handleStrictMatch,
        crossNetworkMatch,
      }),
      evidence: [
        ...result.validated.evidence,
        ...(bioAffirmed ? ["bio profil confirmée (Apify)"] : []),
        ...(followers != null ? [`${followers.toLocaleString("fr-FR")} abonnés`] : []),
      ],
      reason: bioAffirmed
        ? `${result.validated.reason} · bio confirmée`
        : result.validated.reason,
      source: bioAffirmed ? "official_site" : result.validated.source,
    };

    ranked.push({
      candidate,
      validated,
      rankScore: validated.confidence,
      bioAffirmed,
      followers,
      verified,
    });
  }

  const best = pickBestRankedOutcome(ranked);
  if (!best) return { validated: null, rejected };

  for (const loser of ranked) {
    if (loser.candidate.url === best.candidate.url) continue;
    rejected.push({
      url: loser.candidate.url,
      platform,
      reason: `écarté au profit de ${best.candidate.url} (meilleur score multi-sources)`,
    });
  }

  return { validated: best.validated, rejected };
}

export async function discoverOfficialLinks(app: AppDetail): Promise<OfficialLinksDiscoveryResult> {
  const rejected: OfficialLinksDiscoveryResult["rejected_candidates"] = [];
  const notFound: string[] = [];

  const appStoreFromApp = await findAppStoreFromApp(app);
  const websiteFromAppStore = pickOfficialWebsiteFromAppStore(app);
  const ai = await runOpenAiWebDiscovery(app, websiteFromAppStore?.url ?? null);
  const openAiSources = ai?.sources ?? [];

  let website: ValidatedLink | null = null;
  const websiteCandidates: LinkCandidate[] = [];
  if (websiteFromAppStore) websiteCandidates.push(websiteFromAppStore);
  for (const c of openAiCandidates(ai)) {
    if (c.platform === "website") websiteCandidates.push(c);
  }

  for (const raw of websiteCandidates) {
    const prepared = await validateWebsiteCandidate(app, raw);
    if (!prepared) continue;
    const result = await validateLinkCandidate(app, prepared, { openAiSources });
    if (result.validated) {
      website = result.validated;
      break;
    }
    if (result.rejected) rejected.push(result.rejected);
  }
  if (!website) notFound.push("site officiel");

  const brandTokens = brandTokensForApp(app, website?.url ?? websiteFromAppStore?.url ?? null);
  const validateOpts = {
    openAiSources,
    officialWebsiteUrl: website?.url ?? null,
    brandTokens,
  };

  const candidatePool = new Map<SocialPlatform, LinkCandidate[]>();
  let scannedUrls: string[] = [];
  let scrapeCandidates: LinkCandidate[] = [];

  if (website) {
    const scrape = await scrapeOfficialWebsite(website.url);
    scannedUrls = scrape.scannedUrls;
    scrapeCandidates = scrape.candidates;
    for (const c of scrape.candidates) {
      if (!socialUrlMatchesBrandTokens(c.url, brandTokens)) continue;
      pushCandidate(candidatePool, c);
    }
  }

  const websiteHandleCluster = buildWebsiteHandleCluster(scrapeCandidates);

  for (const c of openAiCandidates(ai)) {
    if (!SOCIAL_PLATFORMS.includes(c.platform as (typeof SOCIAL_PLATFORMS)[number])) continue;
    pushCandidate(candidatePool, c);
  }

  const manual = VERIFIED_OFFICIAL_SOCIAL_OVERRIDES[String(app.id)];
  if (manual) {
    for (const platform of OFFICIAL_SOCIAL_OVERRIDE_PLATFORMS) {
      const url = manual[platform];
      if (!url) continue;
      pushCandidate(candidatePool, {
        url,
        platform,
        source: "manual_seed",
        evidence: ["manual_whitelist"],
        note: "Indice manuel Trackapp (concurrence multi-sources)",
      });
    }
  }

  for (const h of buildHeuristicSocialCandidates(app)) {
    pushCandidate(candidatePool, {
      url: h.url,
      platform: h.platform,
      source: "brand_heuristic",
      evidence: ["brand_slug_heuristic"],
      note: `Handle marque probable (${h.url})`,
    });
  }

  const needsAiJudge: LinkCandidate[] = [];
  for (const c of scrapeCandidates) {
    if (!socialUrlMatchesBrandTokens(c.url, brandTokens)) continue;
    if (c.evidence.includes("official_website_link")) {
      needsAiJudge.push(c);
    }
  }
  for (const c of openAiCandidates(ai)) {
    if (c.platform === "website") continue;
    if (!SOCIAL_PLATFORMS.includes(c.platform as (typeof SOCIAL_PLATFORMS)[number])) continue;
    if (needsAiJudge.some((x) => x.platform === c.platform && x.url === c.url)) continue;
    needsAiJudge.push(c);
  }

  if (needsAiJudge.length > 0) {
    const aiRows = await openaiValidateSocialCandidates(app, website?.url ?? null, needsAiJudge);
    for (const row of aiRows) {
      if (row.status !== "validated" || row.confidence < 85) {
        if (row.status === "rejected") {
          const matchRejected = needsAiJudge.find((c) => c.url === row.url);
          rejected.push({
            url: row.url,
            platform: matchRejected?.platform ?? "instagram",
            reason: row.reason,
          });
        }
        continue;
      }
      const match = needsAiJudge.find((c) => c.url === row.url);
      if (!match) continue;
      pushCandidate(candidatePool, {
        ...match,
        evidence: [...match.evidence, "openai_web_search"] as EvidenceKind[],
        note: `Validé par juge IA : ${row.reason}`,
      });
    }
  }

  const socials: OfficialLinksDiscoveryResult["socials"] = {};

  for (const platform of SOCIAL_PLATFORMS) {
    const candidates = candidatePool.get(platform) ?? [];
    if (candidates.length === 0) {
      notFound.push(platform);
      continue;
    }

    const { validated, rejected: platformRejected } = await resolveBestSocialForPlatform(
      app,
      platform,
      candidates,
      validateOpts,
      websiteHandleCluster,
    );
    rejected.push(...platformRejected);

    if (validated) {
      socials[platform] = validated;
    } else {
      notFound.push(platform);
    }
  }

  let app_store: ValidatedLink | null = null;
  let google_play: ValidatedLink | null = null;

  if (appStoreFromApp) {
    const result = await validateLinkCandidate(app, appStoreFromApp, validateOpts);
    if (result.validated) app_store = result.validated;
    else if (result.rejected) rejected.push(result.rejected);
  }
  if (!app_store) notFound.push("App Store");

  for (const c of openAiCandidates(ai)) {
    if (c.platform !== "google_play") continue;
    const prepared = await validateGooglePlayCandidate(app, c);
    if (!prepared) {
      rejected.push({
        url: c.url,
        platform: "google_play",
        reason: "Package Google Play non concordant",
      });
      continue;
    }
    const result = await validateLinkCandidate(app, prepared, validateOpts);
    if (result.validated) {
      google_play = result.validated;
      break;
    }
    if (result.rejected) rejected.push(result.rejected);
  }
  if (!google_play) notFound.push("Google Play");

  let meta_ads_library: OfficialLinksDiscoveryResult["meta_ads_library"] = null;
  let meta_page_name: string | null = null;

  const facebook = socials.facebook;
  if (facebook?.url) {
    const meta = await findMetaPageIdFromFacebookUrl(facebook.url);
    if (meta?.pageId) {
      meta_page_name = meta.pageName ?? null;
      meta_ads_library = {
        url: buildMetaAdsLibraryUrl(meta.pageId),
        page_id: meta.pageId,
        confidence: 100,
        evidence: ["Page Facebook officielle validée", "Meta Graph API", "search_type=page"],
      };
    } else {
      notFound.push("Meta Ads Library (Page ID introuvable)");
    }
  } else if (ai?.meta_page_id && isPlausibleMetaPageId(ai.meta_page_id)) {
    const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
    let pageId: string | null = null;
    if (token) {
      const node = await resolveFacebookPageNode(token, ai.meta_page_id);
      pageId = node?.id ?? null;
      if (node?.name) meta_page_name = node.name;
    }
    if (pageId) {
      meta_ads_library = {
        url: buildMetaAdsLibraryUrl(pageId),
        page_id: pageId,
        confidence: 90,
        evidence: ["Page ID confirmé via Meta Graph", "OpenAI web_search"],
      };
    } else {
      notFound.push("Meta Ads Library (Page ID OpenAI non confirmé par Meta Graph)");
    }
  } else {
    notFound.push("Meta Ads Library");
  }

  return {
    app: app.name,
    appId: app.id,
    website,
    socials,
    app_store,
    google_play,
    meta_ads_library,
    not_found: notFound,
    rejected_candidates: rejected,
    scanned_urls: scannedUrls,
    evidence_urls: openAiSources,
    meta_page_name,
  };
}
