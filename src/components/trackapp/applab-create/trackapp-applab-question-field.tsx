"use client";

import { cn } from "@/lib/utils";
import type { CreateQuestionField } from "@/lib/trackapp-applab-create/create-questions";

export function TrackappApplabQuestionField({
  field,
  draft,
  onDraftChange,
  helpOpen,
  onHelpToggle,
  onSubmit,
  canSubmit,
}: Readonly<{
  field: CreateQuestionField;
  draft: string;
  onDraftChange: (value: string) => void;
  helpOpen: boolean;
  onHelpToggle: () => void;
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
          <p className="ta-applab-clarify-field__help">{field.help}</p>
          {field.examples.length > 0 ? (
            <ul className="ta-applab-clarify-field__examples">
              {field.examples.map((ex) => (
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
        id={`applab-${field.id}`}
        className="ta-applab-glass-panel__field ta-applab-glass-panel__field--area ta-applab-clarify-field__input"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows}
        maxLength={field.maxLength}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
    </div>
  );
}
