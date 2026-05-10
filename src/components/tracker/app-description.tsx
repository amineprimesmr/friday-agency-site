"use client";

import { useState } from "react";

export function AppDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 600;
  const short = text.length > LIMIT;

  return (
    <div>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
        Présentation
      </h2>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-white/65">
          {expanded || !short ? text : text.slice(0, LIMIT) + "…"}
        </p>
        {short && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-xs font-medium text-white/55 transition hover:text-white/80"
          >
            {expanded ? "Voir moins ↑" : "Voir plus ↓"}
          </button>
        )}
      </div>
    </div>
  );
}
