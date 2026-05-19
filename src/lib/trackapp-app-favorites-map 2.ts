import type { AppDetail, SearchResult } from "@/lib/apple-charts";

export function appDetailToSearchResultForFavorites(detail: AppDetail, rank: number): SearchResult {
  const lang = detail.languageCodesISO2A;
  return {
    id: detail.id,
    name: detail.name,
    artworkUrl: detail.artworkUrl,
    artistName: detail.artistName,
    category: detail.category,
    categoryId: detail.categoryId,
    url: detail.url,
    releaseDate: detail.releaseDate,
    rank,
    averageUserRating: detail.averageUserRating,
    userRatingCount: detail.userRatingCount,
    price: detail.price,
    formattedPrice: detail.formattedPrice,
    description: detail.description,
    version: detail.version,
    fileSizeBytes: detail.fileSizeBytes,
    minimumOsVersion: detail.minimumOsVersion,
    ...(lang.length > 0 ? { languageCodesISO2A: lang } : {}),
  };
}
