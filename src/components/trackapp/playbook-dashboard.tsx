"use client";

import { useState } from "react";

import type { PlaybookStep } from "@/lib/trackapp/playbook";

export type VisibleRowPayload = PlaybookStep & { promptRendered: string; visible: boolean };

export function TrackappPlaybookDashboard({ rows }: { rows: VisibleRowPayload[] }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function copyText(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  }

  return (
    <ol className="relative z-[1] list-none space-y-5 p-0 pb-[max(10rem,env(safe-area-inset-bottom))]">
      {rows.map((row, i) => (
        <li key={row.id} className="trackapp-playbook-card">
          <header className="trackapp-playbook-card-header">
            <span className="trackapp-playbook-idx">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="trackapp-playbook-title">{row.title}</h2>
          </header>

          <p className="trackapp-playbook-summary">{row.summary}</p>

          <div className="relative mt-4">
            <div className="trackapp-playbook-pre-wrap">
              <pre className="trackapp-playbook-pre">{row.promptRendered.trim()}</pre>
            </div>

            <div className="mt-4">
              <button type="button" onClick={() => copyText(row.promptRendered, i)} className="trackapp-btn-ghost-dash">
                {copiedIdx === i ? "Prompt copié ✓" : "Copier le prompt"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
