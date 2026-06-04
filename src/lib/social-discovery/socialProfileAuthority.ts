import type { AppDetail } from "@/lib/apple-charts";
import {
  affirmOfficialSocialProfile,
  isSocialBioAffirmConfigured,
  type SocialAffirmPlatform,
} from "@/lib/official-brand-social-affirm";
import { handleMatchesBrandSlug } from "@/lib/official-brand-social-candidates";
import { socialHandleFromUrl } from "@/lib/social-discovery/social-handle-utils";
import type { SocialPlatform } from "@/lib/social-discovery/types";

const MIN_FOLLOWERS_DEFAULT = 100;
const MIN_FOLLOWERS_STRICT_HANDLE = 25;
const SUSPICIOUS_FOLLOWERS_WEBSITE = 15;

export type ProfileAuthorityVerdict = Readonly<{
  pass: boolean;
  bioAffirmed: boolean;
  followers: number | null;
  verified: boolean | null;
  reason: string;
}>;

function isAffirmPlatform(platform: SocialPlatform): platform is SocialAffirmPlatform {
  return platform === "instagram" || platform === "tiktok";
}

export async function evaluateSocialProfileAuthority(
  platform: SocialPlatform,
  profileUrl: string,
  app: AppDetail,
  officialSiteUrl: string | null,
  options: Readonly<{
    fromOfficialWebsite: boolean;
    websiteHandleCluster: readonly string[];
    openAiStructured?: boolean;
    manualSeed?: boolean;
    brandHeuristic?: boolean;
  }>,
): Promise<ProfileAuthorityVerdict> {
  if (!isAffirmPlatform(platform)) {
    return { pass: true, bioAffirmed: false, followers: null, verified: null, reason: "pas de check bio pour cette plateforme" };
  }

  const handle = socialHandleFromUrl(platform, profileUrl);
  const strictHandle = handle ? handleMatchesBrandSlug(handle, app.name) : false;
  const crossMatch = handle ? options.websiteHandleCluster.some((wh) => wh === handle) : false;

  if (!isSocialBioAffirmConfigured()) {
    if (options.fromOfficialWebsite) {
      return {
        pass: true,
        bioAffirmed: false,
        followers: null,
        verified: null,
        reason: "lien site officiel (Apify indisponible)",
      };
    }
    if (strictHandle || crossMatch) {
      return {
        pass: true,
        bioAffirmed: false,
        followers: null,
        verified: null,
        reason: "handle cohérent marque (Apify indisponible)",
      };
    }
    return {
      pass: false,
      bioAffirmed: false,
      followers: null,
      verified: null,
      reason: "vérification bio indisponible et handle non confirmé par le site",
    };
  }

  const affirm = await affirmOfficialSocialProfile(platform, profileUrl, app, officialSiteUrl, {
    strictBrandSlug: !options.fromOfficialWebsite,
  });

  const followers = affirm.followers ?? null;
  const verified = affirm.verified ?? null;

  if (affirm.ok) {
    return {
      pass: true,
      bioAffirmed: true,
      followers,
      verified,
      reason: affirm.reason,
    };
  }

  if (verified === true) {
    return {
      pass: true,
      bioAffirmed: false,
      followers,
      verified,
      reason: "compte vérifié par la plateforme",
    };
  }

  if (
    strictHandle &&
    (options.openAiStructured || options.manualSeed || options.brandHeuristic || crossMatch)
  ) {
    return {
      pass: true,
      bioAffirmed: affirm.ok,
      followers,
      verified,
      reason: affirm.ok
        ? affirm.reason
        : "handle marque confirmé (OpenAI / heuristique / sources multiples)",
    };
  }

  const minFollowers =
    strictHandle || crossMatch ? MIN_FOLLOWERS_STRICT_HANDLE : MIN_FOLLOWERS_DEFAULT;
  if (followers != null && followers >= minFollowers) {
    return {
      pass: true,
      bioAffirmed: false,
      followers,
      verified,
      reason: `audience plausible (${followers.toLocaleString("fr-FR")} abonnés)`,
    };
  }

  if (options.fromOfficialWebsite) {
    if (followers != null && followers < SUSPICIOUS_FOLLOWERS_WEBSITE && !verified) {
      return {
        pass: false,
        bioAffirmed: false,
        followers,
        verified,
        reason: `lien site officiel mais profil suspect (${followers} abonnés, bio non confirmée)`,
      };
    }
    return {
      pass: true,
      bioAffirmed: false,
      followers,
      verified,
      reason: affirm.reason || "lien présent sur le site officiel",
    };
  }

  return {
    pass: false,
    bioAffirmed: false,
    followers,
    verified,
    reason: affirm.reason || "profil non confirmé (bio / audience insuffisante)",
  };
}
