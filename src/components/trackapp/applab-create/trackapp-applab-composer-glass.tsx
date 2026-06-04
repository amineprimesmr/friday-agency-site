"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TrackappApplabComposerGlassSize = "compact" | "expanded";

type TrackappApplabComposerGlassProps = Readonly<{
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  /** `compact` = nom court ; `expanded` = concept / texte long. */
  size?: TrackappApplabComposerGlassSize;
  multiline?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  footer?: ReactNode;
  className?: string;
}>;

export function TrackappApplabComposerGlass({
  fieldId,
  value,
  onChange,
  placeholder,
  ctaLabel,
  onCta,
  ctaDisabled = false,
  size,
  multiline = false,
  maxLength,
  autoFocus = false,
  footer,
  className,
}: TrackappApplabComposerGlassProps) {
  const Field = multiline ? "textarea" : "input";
  const resolvedSize = size ?? (multiline ? "expanded" : "compact");

  return (
    <div
      className={cn(
        "ta-applab-glass-panel",
        resolvedSize === "compact" ? "ta-applab-glass-panel--compact" : "ta-applab-glass-panel--expanded",
        className,
      )}
    >
      <div className="ta-applab-glass-panel__row">
        <div className="ta-applab-glass-panel__editor">
          <Field
            id={fieldId}
            className={cn(
              "ta-applab-glass-panel__field",
              multiline && "ta-applab-glass-panel__field--area",
            )}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoFocus={autoFocus}
            rows={multiline ? 3 : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !ctaDisabled) {
                e.preventDefault();
                onCta();
              }
            }}
          />
        </div>

        <aside className="ta-applab-glass-panel__aside">
          <button
            type="button"
            className="ta-applab-glass-panel__cta"
            disabled={ctaDisabled}
            onClick={onCta}
          >
            <span className="ta-applab-glass-panel__cta-label">{ctaLabel}</span>
          </button>
        </aside>
      </div>

      {footer ? <div className="ta-applab-glass-panel__footer">{footer}</div> : null}
    </div>
  );
}
