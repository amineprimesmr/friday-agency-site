"use client";

import { cn } from "@/lib/utils";

import type { OnboardingOption } from "@/lib/trackapp-onboarding/types";

const BAR_COUNT = 4;

function GridLevelBars({
  index,
  totalOptions,
}: Readonly<{ index: number; totalOptions: number }>) {
  const filledFromBottom = Math.max(
    1,
    Math.min(BAR_COUNT, Math.round(((index + 1) / totalOptions) * BAR_COUNT)),
  );

  return (
    <span className="ta-onboarding__grid-bars" aria-hidden>
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const isLit = i >= BAR_COUNT - filledFromBottom;
        return (
          <span
            key={i}
            className={cn("ta-onboarding__grid-bar", isLit ? "is-lit" : "is-dim")}
          />
        );
      })}
    </span>
  );
}

export function TrackappOnboardingGridOptions({
  options,
  selectedId,
  disabled,
  onSelect,
}: Readonly<{
  options: readonly OnboardingOption[];
  selectedId?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}>) {
  return (
    <div className="ta-onboarding__grid">
      {options.map((opt, index) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={cn("ta-onboarding__grid-card", isSelected && "is-selected")}
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onSelect(opt.id)}
          >
            <GridLevelBars index={index} totalOptions={options.length} />
            <span className="ta-onboarding__grid-card-foot">
              <span className="ta-onboarding__grid-card-label">{opt.label}</span>
              <span className="ta-onboarding__grid-card-radio" aria-hidden />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const ONBOARDING_GRID_STEP_IDS = new Set([
  "experience",
  "frustration",
  "monetization_model",
  "project_status",
]);
