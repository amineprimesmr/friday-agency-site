import type { AppDetail } from "@/lib/apple-charts";

export function buildCompetitorAnalysisUserPrompt(args: {
  app: AppDetail;
  country: string;
  revenueDisplay: string;
  downloadsDisplay: string;
  genrePeerNames: string[];
  officialSiteHint: string | null;
}): string {
  const desc = (args.app.description ?? "").slice(0, 2800);
  const peers =
    args.genrePeerNames.length > 0
      ? args.genrePeerNames.slice(0, 12).join(", ")
      : "aucun";

  return [
    "Tu es un analyste marché spécialisé en applications mobiles iOS.",
    "",
    "Mission : identifier les VRAIS concurrents (même transformation utilisateur), pas des apps populaires hors sujet.",
    "",
    "Règles absolues :",
    "- Ne jamais se baser uniquement sur le nom de l'app.",
    "- Comprendre le problème résolu, la cible, les fonctionnalités, le positionnement.",
    "- Mieux vaut manquer un concurrent que proposer une app hors sujet (ex. CapCut pour une app d'audit TikTok).",
    "- Utilise web_search pour valider les apps et trouver des alternatives réelles.",
    "- Chaque concurrent doit exister ; URLs App Store / site si trouvées dans tes sources.",
    "",
    `App à analyser : ${args.app.name}`,
    `Pays store : ${args.country}`,
    `Éditeur : ${args.app.artistName}`,
    `Catégorie App Store : ${args.app.primaryGenreName || args.app.category || "—"}`,
    `Prix : ${args.app.formattedPrice}`,
    `Note : ${args.app.averageUserRating} (${args.app.userRatingCount} avis)`,
    `Revenus Trackapp : ${args.revenueDisplay}`,
    `Téléchargements Trackapp : ${args.downloadsDisplay}`,
    `Site officiel (indice) : ${args.officialSiteHint ?? "inconnu"}`,
    `URL App Store : ${args.app.trackViewUrl || args.app.url}`,
    "",
    "Description App Store :",
    desc || "—",
    "",
    `Apps du même genre (top charts — à ne PAS confondre avec concurrents sémantiques) : ${peers}`,
    "",
    "Étapes :",
    "1) Résume le vrai produit en une phrase.",
    "2) Remplis le profil de compréhension (core problem, cible, use cases, features, NOT competitors).",
    "3) Liste les catégories de concurrents pertinentes.",
    "4) Génère search_queries_used (requêtes sémantiques, pas seulement le nom de l'app).",
    "5) Propose 6 à 8 concurrents scorés (similarity_score 0-100) : direct / close / indirect / old / rising. JSON compact : phrases courtes.",
    "6) Rejette 3 à 8 faux concurrents populaires avec raison.",
    "",
    "Scoring (similarity_score) :",
    "- 85-100 : direct (même problème, même cible)",
    "- 65-84 : close",
    "- 40-64 : indirect",
    "- <40 : rejeter sauf stratégique",
  ].join("\n");
}
