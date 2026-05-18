import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "App Store Tracker — Classements iOS en temps réel",
    template: "%s · App Store Tracker",
  },
  description:
    "Suivez les classements App Store en temps réel : Top Charts, nouveautés, mouvements de rangs par pays et catégorie.",
};

/** Le champ de recherche utilise 16px côté CSS (évite le zoom auto iOS au focus). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
