"use client";

import { useMemo } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatTrialMsLeft(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, compact: `${days}j ${pad2(hours)}h ${pad2(minutes)}m` };
}

export function TrialCountdownHero({ msLeft }: Readonly<{ msLeft: number }>) {
  const { days, hours, minutes, seconds } = useMemo(() => formatTrialMsLeft(msLeft), [msLeft]);
  return (
    <span className="app-saas-frc-countdown" aria-label="Compte à rebours de l'offre en cours">
      <span className="app-saas-frc-countdown__item">
        <strong>{days}</strong>
        <em>jours</em>
      </span>
      <span className="app-saas-frc-countdown__sep">:</span>
      <span className="app-saas-frc-countdown__item">
        <strong>{pad2(hours)}</strong>
        <em>heures</em>
      </span>
      <span className="app-saas-frc-countdown__sep">:</span>
      <span className="app-saas-frc-countdown__item">
        <strong>{pad2(minutes)}</strong>
        <em>min</em>
      </span>
      <span className="app-saas-frc-countdown__sep">:</span>
      <span className="app-saas-frc-countdown__item">
        <strong>{pad2(seconds)}</strong>
        <em>sec</em>
      </span>
    </span>
  );
}

export function TrialCountdownTopbar({ msLeft }: Readonly<{ msLeft: number }>) {
  const { days, hours, minutes, seconds } = useMemo(() => formatTrialMsLeft(msLeft), [msLeft]);
  return (
    <span className="app-topbar-trial-countdown-grid" aria-hidden="true">
      <span className="app-topbar-trial-countdown-cell">
        <strong>{days}</strong>
        <em>jours</em>
      </span>
      <span className="app-topbar-trial-countdown-cell">
        <strong>{pad2(hours)}</strong>
        <em>heures</em>
      </span>
      <span className="app-topbar-trial-countdown-cell">
        <strong>{pad2(minutes)}</strong>
        <em>min</em>
      </span>
      <span className="app-topbar-trial-countdown-cell">
        <strong>{pad2(seconds)}</strong>
        <em>sec</em>
      </span>
    </span>
  );
}
