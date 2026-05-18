import type { Metadata, Viewport } from "next";
import { TrackerHeader } from "@/components/tracker/tracker-header";
import { TrackerFooter } from "@/components/tracker/tracker-footer";
import { TrackerNavigationProvider } from "@/components/tracker/tracker-navigation";
import "@/styles/shiny-cta-button.css";
import "@/styles/trackapp-purple.css";
import "@/styles/tracker-ux.css";

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
    <TrackerNavigationProvider>
      <div
        data-tracker
        className="min-h-dvh bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.07),#000000)] font-sans text-white antialiased"
      >
        <TrackerHeader />
        <main className="pt-[var(--tracker-header-offset)]">
          {children}
        </main>
        <TrackerFooter />
      </div>
    </TrackerNavigationProvider>
  );
}
