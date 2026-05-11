"use client";

import { formatTrialMsLeft, TrialCountdownHero } from "@/components/trackapp/trackapp-trial-countdown";

type ClusterMode = "trial-paywall" | "onboarding-info";

export function TrackappSaasWelcomeCluster({
  show,
  mode,
  trialMsLeft,
  stripeReady,
  onSubscribe,
}: Readonly<{
  show: boolean;
  mode: ClusterMode;
  trialMsLeft: number;
  stripeReady: boolean;
  onSubscribe: () => void;
}>) {
  if (!show) return null;

  if (mode === "onboarding-info") {
    return (
      <div id="app-saas-frc-cluster" className="app-saas-frc-cluster app-saas-frc-cluster--unpaid" aria-hidden="false">
        <div className="app-saas-frc-hero">
          <div className="app-saas-frc-hero-inner">
            <p className="app-saas-frc-kicker">Trackapp</p>
            <h2 id="app-saas-frc-title" className="app-saas-frc-title">
              Configuration express
            </h2>
            <p id="app-saas-frc-subtitle" className="app-saas-frc-subtitle">
              Quelques informations sur ton projet — puis accès au playbook Xcode découpé en prompts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { compact } = formatTrialMsLeft(trialMsLeft);

  return (
    <div
      id="app-saas-frc-cluster"
      className="app-saas-frc-cluster app-saas-frc-cluster--unpaid app-saas-frc-cluster--trial"
      aria-hidden="false"
    >
      <div className="app-saas-frc-hero app-saas-frc-hero--trial">
        <div className="app-saas-frc-hero-inner">
          <p className="app-saas-frc-kicker">Trackapp</p>
          <h2 id="app-saas-frc-title" className="app-saas-frc-title">
            Ton playbook en mode aperçu
          </h2>
          <p id="app-saas-frc-subtitle" className="app-saas-frc-subtitle">
            <TrialCountdownHero msLeft={trialMsLeft} />
          </p>
          <button
            type="button"
            id="app-saas-frc-cta"
            className="app-saas-frc-btn-primary"
            disabled={!stripeReady}
            onClick={onSubscribe}
          >
            Débloquer tout le playbook
          </button>
          <p id="app-saas-frc-support" className="app-saas-frc-support app-saas-frc-support--trial-hero">
            <span className="app-saas-frc-support-cta-wrap">
              <button type="button" id="app-saas-frc-support-cta" className="app-saas-frc-support-cta" onClick={onSubscribe}>
                Débloquer
              </button>
              <span className="app-saas-frc-support-badge" aria-hidden="true">
                Pro
              </span>
            </span>
          </p>
        </div>
      </div>
      <div id="app-saas-frc-strip" className="app-saas-frc-strip" aria-hidden="false">
        <div className="app-saas-frc-strip-main">
          <span className="app-saas-frc-strip-strong">Débloquer le playbook complet</span>
          <div className="app-saas-frc-strip-subrow">
            <span className="app-saas-frc-strip-dot" aria-hidden="true" />
            <span id="app-saas-frc-strip-status" className="app-saas-frc-strip-status">
              {compact}
            </span>
          </div>
        </div>
        <span className="app-saas-frc-strip-cta-wrap">
          <button
            type="button"
            id="app-saas-frc-strip-cta"
            className="app-saas-frc-strip-cta"
            aria-label="Débloquer le playbook"
            disabled={!stripeReady}
            onClick={onSubscribe}
          >
            Débloquer
          </button>
          <span className="app-saas-frc-strip-badge">PRO</span>
        </span>
      </div>
    </div>
  );
}
