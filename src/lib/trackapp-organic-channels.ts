export const TRACKAPP_ORGANIC_CHANNELS = [
  {
    id: "tiktok",
    title: "TikTok",
    badge: "Viralité",
    copy: "Repérez les hooks, formats UGC et angles qui font performer une app avant de lancer vos propres vidéos.",
    steps: ["Analyser les 10 derniers posts", "Noter hooks et CTA", "Tester 3 variantes courtes"],
  },
  {
    id: "instagram",
    title: "Instagram",
    badge: "Crédibilité",
    copy: "Reels, carrousels et stories : comprenez comment une app construit sa preuve sociale et son positionnement.",
    steps: ["Reels vs posts statiques", "Fréquence de publication", "Lien bio et landing"],
  },
  {
    id: "shorts",
    title: "Shorts & Reels",
    badge: "Itération",
    copy: "Le format court permet de tester plusieurs promesses rapidement — copiez la structure, pas le contenu.",
    steps: ["Hook 0–2 s", "Démo produit 5–15 s", "CTA App Store clair"],
  },
] as const;

export type TrackappOrganicChannelId = (typeof TRACKAPP_ORGANIC_CHANNELS)[number]["id"];
