import type { Metadata, Viewport } from "next";
import { TrackerHeader } from "@/components/tracker/tracker-header";
import { TrackerFooter } from "@/components/tracker/tracker-footer";
import "@/styles/shiny-cta-button.css";
import "@/styles/trackapp-purple.css";
import "@/styles/tracker-ux.css";
import { TrackerTrackappBeacon } from "@/components/trackapp/tracker-trackapp-beacon";

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
  return (
    <div
      data-tracker
      className="min-h-dvh bg-black font-sans text-white antialiased"
    >
      <TrackerHeader />
      <TrackerTrackappBeacon />
      <main className="pt-[calc(5.75rem+env(safe-area-inset-top,0px))] max-md:pt-[calc(6.375rem+env(safe-area-inset-top,0px))]">
        {children}
      </main>
      <TrackerFooter />
    </div>
  );
}
