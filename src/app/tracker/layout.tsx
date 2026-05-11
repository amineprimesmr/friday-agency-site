import type { Metadata } from "next";
import { TrackerHeader } from "@/components/tracker/tracker-header";
import { TrackerFooter } from "@/components/tracker/tracker-footer";
import "@/styles/shiny-cta-button.css";

export const metadata: Metadata = {
  title: {
    default: "App Store Tracker — Classements iOS en temps réel",
    template: "%s · App Store Tracker",
  },
  description:
    "Suivez les classements App Store en temps réel : Top Charts, nouveautés, mouvements de rangs par pays et catégorie.",
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-black font-sans text-white antialiased">
      <TrackerHeader />
      <main className="pt-[calc(5.75rem+env(safe-area-inset-top,0px))] max-md:pt-[calc(6.375rem+env(safe-area-inset-top,0px))]">
        {children}
      </main>
      <TrackerFooter />
    </div>
  );
}
