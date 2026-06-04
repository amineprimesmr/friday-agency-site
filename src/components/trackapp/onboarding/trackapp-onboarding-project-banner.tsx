import Link from "next/link";

import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";
import {
  hasDefinedOnboardingProject,
  isDiscoverOnboardingMode,
} from "@/lib/trackapp-onboarding/resolve-steps";
import type { TrackappUserOnboardingPayload } from "@/lib/trackapp-onboarding/types";

import "@/styles/trackapp-onboarding-project-banner.css";

export function TrackappOnboardingProjectBanner({
  payload,
}: Readonly<{ payload: TrackappUserOnboardingPayload | null }>) {
  if (!payload) return null;

  if (hasDefinedOnboardingProject(payload)) {
    const name = payload.project?.name?.trim();
    if (!name) return null;
    const goal = payload.answers.monetization_model;

    return (
      <section className="ta-project-banner" aria-label="Votre projet AppLAB">
        <div className="ta-project-banner__inner">
          <div>
            <p className="ta-project-banner__eyebrow">Votre projet AppLAB</p>
            <h2 className="ta-project-banner__title">{name}</h2>
            <p className="ta-project-banner__sub">
              Workspace personnalisé — analyse AppLAB et formation adaptées à votre projet
              {goal ? ` · objectif ${goal.replace(/_/g, " ")}` : ""}.
            </p>
          </div>
          <Link href="/trackapp" className="ta-project-banner__cta">
            Ouvrir AppLAB →
          </Link>
        </div>
      </section>
    );
  }

  if (isDiscoverOnboardingMode(payload)) {
    return (
      <section className="ta-project-banner ta-project-banner--discover" aria-label="Mode exploration">
        <div className="ta-project-banner__inner">
          <div>
            <p className="ta-project-banner__eyebrow">Mode exploration</p>
            <h2 className="ta-project-banner__title">Trouvez votre prochain lancement</h2>
            <p className="ta-project-banner__sub">
              Trackapp t&apos;aide à repérer les apps à cloner ou les niches à attaquer — AppLAB s&apos;active sur
              chaque fiche. Nommez un projet quand vous êtes prêt.
            </p>
          </div>
          <Link href="/trackapp" className="ta-project-banner__cta">
            Créer mon workspace →
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
