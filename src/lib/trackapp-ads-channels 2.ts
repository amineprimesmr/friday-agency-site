export const TRACKAPP_ADS_CHANNELS = [
  {
    id: "apple-search-ads",
    title: "Apple Search Ads",
    badge: "Priorité",
    copy: "Teste les mots-clés avec intention d'achat directement dans l'App Store. C'est le canal le plus simple pour valider si des utilisateurs cherchent déjà ton problème.",
    steps: ["5 à 10 mots-clés exact match", "Budget test 10 à 30 € / jour", "Suivi taps, installs, trial et achat"],
  },
  {
    id: "meta-ads",
    title: "Meta Ads",
    badge: "Créa",
    copy: "Utile pour valider une promesse, une audience et des angles visuels avant d'investir lourdement dans le produit.",
    steps: ["3 hooks différents", "2 formats vidéo courts", "Landing ou App Store Product Page dédiée"],
  },
  {
    id: "tiktok-ads",
    title: "TikTok Ads",
    badge: "Volume",
    copy: "À lancer quand tu as déjà un angle organique qui réagit. Le paid amplifie ce qui montre un signal naturel.",
    steps: ["Spark Ads si contenu gagnant", "UGC court et démonstratif", "Test par douleur utilisateur"],
  },
] as const;

export type TrackappAdsChannelId = (typeof TRACKAPP_ADS_CHANNELS)[number]["id"];
