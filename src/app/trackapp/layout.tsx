import type { Metadata } from "next";

import "@/styles/trackapp-fidelity-tokens.css";
import "@/styles/trackapp-main-content.css";
import "@/styles/trackapp-purple.css";

export const metadata: Metadata = {
  title: "Trackapp — Du concept aux prompts Xcode",
};

/** Layout racine léger : pas d’appel Supabase ici (réservé au groupe workspace). */
export default function TrackappLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
