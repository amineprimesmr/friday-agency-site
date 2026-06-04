"use client";

import type { ApplabCreateConstraints } from "@/lib/trackapp-applab-create/mvp-prompt-types";

export function TrackappApplabConstraintsStep({
  constraints,
  onChange,
}: Readonly<{
  constraints: ApplabCreateConstraints;
  onChange: (next: ApplabCreateConstraints) => void;
}>) {
  return (
    <div className="ta-applab-constraints ta-applab-constraints--glass">
      <label className="ta-applab-constraints__label" htmlFor="applab-must-have">
        Must-have (obligatoire en v1.0)
      </label>
      <textarea
        id="applab-must-have"
        className="ta-applab-glass-panel__field ta-applab-glass-panel__field--area ta-applab-constraints__field"
        value={constraints.mustHave}
        onChange={(e) => onChange({ ...constraints, mustHave: e.target.value })}
        placeholder="Ex. Mode offline, streaks quotidiens, sync iCloud, dark mode natif…"
        maxLength={600}
        rows={3}
      />

      <label className="ta-applab-constraints__label" htmlFor="applab-must-not">
        Must-not (interdit explicitement)
      </label>
      <textarea
        id="applab-must-not"
        className="ta-applab-glass-panel__field ta-applab-glass-panel__field--area ta-applab-constraints__field"
        value={constraints.mustNot}
        onChange={(e) => onChange({ ...constraints, mustNot: e.target.value })}
        placeholder="Ex. Pas de login obligatoire, pas de pub, pas de contenu généré sans validation…"
        maxLength={600}
        rows={3}
      />

      <p className="ta-applab-constraints__hint">
        Optionnel — laissez vide si vous n&apos;avez rien à ajouter.
      </p>
    </div>
  );
}
