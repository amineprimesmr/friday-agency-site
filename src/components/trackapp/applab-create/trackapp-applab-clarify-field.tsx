"use client";

import { cn } from "@/lib/utils";
import type { ClarifyFlowQuestion } from "@/lib/trackapp-applab-create/clarify-flow";

export function TrackappApplabClarifyField({
  question,
  draft,
  onDraftChange,
  helpOpen,
  onHelpToggle,
  disabled,
  onSubmit,
  canSubmit,
}: Readonly<{
  question: ClarifyFlowQuestion;
  draft: string;
  onDraftChange: (value: string) => void;
  helpOpen: boolean;
  onHelpToggle: () => void;
  disabled?: boolean;
  onSubmit: () => void;
  canSubmit: boolean;
}>) {
  return (
    <div className="ta-applab-clarify-field">
      <div className="ta-applab-clarify-field__head">
        <button
          type="button"
          className={cn("ta-applab-clarify-field__help-btn", helpOpen && "is-active")}
          onClick={onHelpToggle}
          aria-expanded={helpOpen}
        >
          Aide
        </button>
      </div>

      {helpOpen ? (
        <div className="ta-applab-clarify-field__help-block">
          <p className="ta-applab-clarify-field__help">{question.help}</p>
          {question.examples.length > 0 ? (
            <ul className="ta-applab-clarify-field__examples">
              {question.examples.map((ex) => (
                <li key={ex}>
                  <button type="button" className="ta-applab-clarify-field__example-btn" onClick={() => onDraftChange(ex)}>
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <textarea
        id={`clarify-flow-${question.id}`}
        className="ta-applab-glass-panel__field ta-applab-glass-panel__field--area ta-applab-clarify-field__input"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder={question.placeholder}
        rows={3}
        maxLength={600}
        disabled={disabled}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />

      <p className="ta-applab-clarify-field__hint">
        Réponse libre — min. {question.minLength} caractères. ⌘/Ctrl + Entrée pour continuer.
      </p>
    </div>
  );
}
