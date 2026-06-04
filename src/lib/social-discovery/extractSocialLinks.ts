import { scrapeOfficialWebsite } from "@/lib/social-discovery/scrapeOfficialWebsite";
import type { LinkCandidate } from "@/lib/social-discovery/types";

/** Extrait les liens sociaux / stores depuis le HTML du site officiel. */
export async function extractSocialLinksFromOfficialWebsite(
  websiteUrl: string,
): Promise<Readonly<{ scannedUrls: string[]; candidates: LinkCandidate[] }>> {
  return scrapeOfficialWebsite(websiteUrl);
}
