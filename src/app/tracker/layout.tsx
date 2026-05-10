import type { Metadata } from "next";
import { TrackerHeader } from "@/components/tracker/tracker-header";
import { TrackerFooter } from "@/components/tracker/tracker-footer";

export const metadata: Metadata = {
  title: {
    default: "App Store Tracker — Classements iOS en temps réel",
    template: "%s · App Store Tracker",
  },
  description:
    "Suivez les classements App Store en temps réel : Top Charts, nouveautés, mouvements de rangs par pays et catégorie.",
};

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#070710] font-sans text-white antialiased">
      <TrackerHeader />
      <main>{children}</main>
      <TrackerFooter />
    </div>
  );
}
