import type { AppDetail } from "@/lib/apple-charts";
import { verifyOutboundUrl } from "@/lib/official-brand-url-verify";
import { appStoreUrlMatchesApp } from "@/lib/social-discovery/normalizeUrls";
import type { LinkCandidate } from "@/lib/social-discovery/types";

export async function findAppStoreFromApp(app: AppDetail): Promise<LinkCandidate | null> {
  const url = app.trackViewUrl?.trim();
  if (!url || !appStoreUrlMatchesApp(app.id, url)) return null;
  const verify = await verifyOutboundUrl(url);
  if (!verify.ok) return null;
  return {
    url,
    platform: "app_store",
    source: "app_store_listing",
    evidence: ["app_store_listing", "http_verified"],
    note: `Fiche App Store : ${app.name} · ${app.sellerName || app.artistName}`,
  };
}
