import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Trackapp — Trouvez les meilleures apps à copier",
    template: "%s · Trackapp",
  },
  description:
    "Recherche App Store, métriques et outils pour lancer et monétiser votre app iOS.",
};

/** Le champ de recherche utilise 16px côté CSS (évite le zoom auto iOS au focus). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
