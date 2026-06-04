/** URL Meta Ads Library — uniquement via `view_all_page_id` (jamais keyword search). */
export function buildMetaAdsLibraryUrl(pageId: string): string {
  const url = new URL("https://www.facebook.com/ads/library/");
  url.searchParams.set("active_status", "active");
  url.searchParams.set("ad_type", "all");
  url.searchParams.set("country", "ALL");
  url.searchParams.set("is_targeted_country", "false");
  url.searchParams.set("media_type", "all");
  url.searchParams.set("search_type", "page");
  url.searchParams.set("sort_data[direction]", "desc");
  url.searchParams.set("sort_data[mode]", "total_impressions");
  url.searchParams.set("view_all_page_id", pageId);
  return url.toString();
}
