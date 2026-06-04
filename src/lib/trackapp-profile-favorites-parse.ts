export function parseFavoriteIdList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
}

export function isMissingFavoritesColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("app_favorites")
    || m.includes("design_favorites")
    || m.includes("ads_favorites")
    || (m.includes("column") && m.includes("does not exist"))
    || m.includes("schema cache")
    || m.includes("42703")
  );
}

export const FAVORITES_MIGRATION_HINT =
  "Migration Supabase manquante (colonnes favoris). Exécutez les fichiers dans supabase/migrations/ sur votre projet Supabase.";
