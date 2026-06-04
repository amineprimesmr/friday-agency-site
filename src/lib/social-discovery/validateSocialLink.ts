import type { AppDetail } from "@/lib/apple-charts";
import { urlHasWebEvidence, verifyOutboundUrl } from "@/lib/official-brand-url-verify";
import { meetsValidationThreshold, scoreFromEvidence } from "@/lib/social-discovery/confidenceScore";
import {
  appStoreUrlMatchesApp,
  detectPlatformFromUrl,
  googlePlayUrlMatchesBundle,
  isKeywordMetaAdsLibraryUrl,
} from "@/lib/social-discovery/normalizeUrls";
import { socialUrlMatchesBrandTokens, socialUrlStrictBrandMatch } from "@/lib/social-discovery/brand-social-heuristic";
import type { EvidenceKind, LinkCandidate, RejectedCandidate, ValidatedLink } from "@/lib/social-discovery/types";

const VERIFY_PLATFORM: Partial<
  Record<
    LinkCandidate["platform"],
    "instagram" | "tiktok" | "x" | "youtube" | "facebook" | "linkedin" | "threads" | "site" | "metaAdsLibrary"
  >
> = {
  website: "site",
  instagram: "instagram",
  tiktok: "tiktok",
  x: "x",
  youtube: "youtube",
  facebook: "facebook",
  linkedin: "linkedin",
  threads: "threads",
};

function mapSource(candidate: LinkCandidate): ValidatedLink["source"] {
  if (candidate.evidence.includes("official_website_link")) return "official_site";
  if (candidate.evidence.includes("app_store_listing") || candidate.evidence.includes("app_store_developer_website")) {
    return "app_store";
  }
  if (candidate.evidence.includes("openai_web_search")) return "openai_web";
  if (candidate.evidence.includes("manual_whitelist")) return "manual";
  return "official_site";
}

export async function validateLinkCandidate(
  app: AppDetail,
  candidate: LinkCandidate,
  options?: Readonly<{
    openAiSources?: string[];
    officialWebsiteUrl?: string | null;
    brandTokens?: readonly string[];
  }>,
): Promise<{ validated: ValidatedLink | null; rejected: RejectedCandidate | null }> {
  const detected = detectPlatformFromUrl(candidate.url);
  if (detected !== candidate.platform) {
    return {
      validated: null,
      rejected: {
        url: candidate.url,
        platform: candidate.platform,
        reason: "URL ne correspond pas à la plateforme attendue",
      },
    };
  }

  if (candidate.platform === "meta_ads_library" && isKeywordMetaAdsLibraryUrl(candidate.url)) {
    return {
      validated: null,
      rejected: {
        url: candidate.url,
        platform: candidate.platform,
        reason: "Meta Ads Library : recherche par mot-clé interdite (Page ID requis)",
      },
    };
  }

  if (candidate.platform === "app_store" && !appStoreUrlMatchesApp(app.id, candidate.url)) {
    return {
      validated: null,
      rejected: {
        url: candidate.url,
        platform: candidate.platform,
        reason: "App Store : ID ne correspond pas à l'app analysée",
      },
    };
  }

  if (candidate.platform === "google_play" && !googlePlayUrlMatchesBundle(app.bundleId, candidate.url)) {
    return {
      validated: null,
      rejected: {
        url: candidate.url,
        platform: candidate.platform,
        reason: "Google Play : package ne correspond pas au bundle de l'app",
      },
    };
  }

  const evidence = [...candidate.evidence] as EvidenceKind[];
  const brandTokens = options?.brandTokens ?? [];

  if (
    candidate.evidence.includes("openai_structured_output") &&
    candidate.platform !== "website" &&
    candidate.platform !== "app_store" &&
    candidate.platform !== "google_play"
  ) {
    if (brandTokens.length > 0 && !socialUrlMatchesBrandTokens(candidate.url, brandTokens)) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: "OpenAI : handle ne correspond pas à la marque de l'app",
        },
      };
    }
    const sources = options?.openAiSources ?? [];
    const strictBrand = socialUrlStrictBrandMatch(candidate.url, app.name);
    if (!urlHasWebEvidence(candidate.url, sources) && !strictBrand) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: "OpenAI : URL absente des sources web_search",
        },
      };
    }
    const platform = VERIFY_PLATFORM[candidate.platform];
    const verify = await verifyOutboundUrl(candidate.url, platform);
    if (!verify.ok) {
      return {
        validated: null,
        rejected: { url: candidate.url, platform: candidate.platform, reason: verify.reason },
      };
    }
    const ev = [...evidence];
    if (!ev.includes("http_verified")) ev.push("http_verified");
    if (!ev.includes("openai_web_search")) ev.push("openai_web_search");
    const score = scoreFromEvidence(ev);
    if (!meetsValidationThreshold(ev, score)) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: `OpenAI structuré : preuves insuffisantes (score ${score}/100)`,
        },
      };
    }
    return {
      validated: {
        url: candidate.url,
        platform: candidate.platform,
        confidence: score,
        evidence: [
          "réponse structurée OpenAI",
          "source OpenAI web_search",
          verify.httpStatus === 403 ? "profil IG/TikTok (mur anti-bot)" : "page active (HTTP)",
        ],
        reason: candidate.note ?? "Compte officiel (OpenAI web_search + sources)",
        source: "openai_web",
      },
      rejected: null,
    };
  }

  if (candidate.evidence.includes("brand_slug_heuristic")) {
    if (!socialUrlStrictBrandMatch(candidate.url, app.name)) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: "Heuristique : handle ne correspond pas au slug marque",
        },
      };
    }
    const platform = VERIFY_PLATFORM[candidate.platform];
    const verify = await verifyOutboundUrl(candidate.url, platform);
    if (verify.ok && !evidence.includes("http_verified")) evidence.push("http_verified");
    const score = scoreFromEvidence(evidence);
    if (!meetsValidationThreshold(evidence, score)) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: `Heuristique marque : preuves insuffisantes (score ${score}/100)`,
        },
      };
    }
    return {
      validated: {
        url: candidate.url,
        platform: candidate.platform,
        confidence: score,
        evidence: [
          "handle déduit du nom de marque",
          verify.ok ? "page active (HTTP)" : "validation différée (Apify)",
        ],
        reason: candidate.note ?? "Compte probable (handle = marque)",
        source: "official_site",
      },
      rejected: null,
    };
  }

  if (candidate.platform === "website") {
    const verify = await verifyOutboundUrl(candidate.url, "site");
    if (!verify.ok) {
      return {
        validated: null,
        rejected: { url: candidate.url, platform: "website", reason: verify.reason },
      };
    }
    if (!evidence.includes("http_verified")) evidence.push("http_verified");
  } else {
    const platform = VERIFY_PLATFORM[candidate.platform];
    const verify = await verifyOutboundUrl(candidate.url, platform);
    if (!verify.ok) {
      return {
        validated: null,
        rejected: { url: candidate.url, platform: candidate.platform, reason: verify.reason },
      };
    }
    if (!evidence.includes("http_verified")) evidence.push("http_verified");
  }

  const aiJudgeValidated = (candidate.note ?? "").includes("Validé par juge IA");
  if (candidate.evidence.includes("openai_web_search") && !aiJudgeValidated) {
    const sources = options?.openAiSources ?? [];
    if (!urlHasWebEvidence(candidate.url, sources)) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: "OpenAI : URL absente des sources web_search",
        },
      };
    }
  }

  if (candidate.evidence.includes("manual_whitelist")) {
    const score = scoreFromEvidence(evidence);
    if (!meetsValidationThreshold(evidence, score)) {
      return {
        validated: null,
        rejected: {
          url: candidate.url,
          platform: candidate.platform,
          reason: `Indice manuel : preuves insuffisantes (score ${score}/100)`,
        },
      };
    }
    const evidenceLabels = evidence.map((e) =>
      e === "manual_whitelist" ? "indice manuel Trackapp" : e === "http_verified" ? "page active (HTTP)" : e,
    );
    return {
      validated: {
        url: candidate.url,
        platform: candidate.platform,
        confidence: score,
        evidence: evidenceLabels,
        reason: candidate.note ?? "Indice manuel (Trackapp) — confirmé HTTP",
        source: "manual",
      },
      rejected: null,
    };
  }

  const score = scoreFromEvidence(evidence);
  if (!meetsValidationThreshold(evidence, score)) {
    return {
      validated: null,
      rejected: {
        url: candidate.url,
        platform: candidate.platform,
        reason: `Preuves insuffisantes (${evidence.length} preuve(s), score ${score}/100)`,
      },
    };
  }

  const evidenceLabels = evidence.map((e) => {
    switch (e) {
      case "official_website_link":
        return "lien sur le site officiel";
      case "app_store_developer_website":
        return "site développeur App Store";
      case "app_store_listing":
        return "fiche App Store";
      case "google_play_listing":
        return "fiche Google Play";
      case "http_verified":
        return "page active (HTTP)";
      case "openai_web_search":
        return "source OpenAI web_search";
      case "meta_graph_page":
        return "Page Facebook via Meta Graph";
      case "manual_whitelist":
        return "liste blanche Trackapp";
      case "brand_slug_heuristic":
        return "handle déduit du nom de marque";
      default:
        return e;
    }
  });

  return {
    validated: {
      url: candidate.url,
      platform: candidate.platform,
      confidence: score,
      evidence: evidenceLabels,
      reason: candidate.note ?? evidenceLabels.join(" · "),
      source: mapSource(candidate),
    },
    rejected: null,
  };
}
