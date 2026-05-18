import type { Metadata } from "next";

import { CreateAppJourney } from "@/components/trackapp/create-app-journey";

export const metadata: Metadata = {
  title: "Créer mon app — Trackapp",
  description: "Parcours guidé pour créer une app iOS avec l'IA, de l'idée au lancement.",
};

export default function TrackappCreerMonAppPage() {
  return <CreateAppJourney />;
}
