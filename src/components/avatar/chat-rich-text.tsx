"use client";

import type { ReactNode } from "react";
import { stripCodeFencesForDisplay } from "@/lib/studio-system-prompt";

/** Enlève un * orphelin en début de ligne (ex. *Dis-moi quand le Markdown est cassé). */
function normalizeStrayAsterisks(line: string): string {
  if (/^\*+(?!\*)/.test(line)) {
    return line.replace(/^\*+/, "");
  }
  return line;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[\s\S]+?\*\*)/g);
  return parts.filter(Boolean).map((part, i) => {
    const m = part.match(/^\*\*([\s\S]+)\*\*$/);
    if (m) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white/95">
          {m[1]}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

export function ChatRichText({ content }: { content: string }) {
  const raw = stripCodeFencesForDisplay(content);
  const lines = raw.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const normalized = normalizeStrayAsterisks(line);
        const t = normalized.trim();
        if (!t) return <div key={i} className="h-1" />;

        if (t.startsWith("### ")) {
          return (
            <p key={i} className="text-sm font-semibold text-white/90">
              {renderInline(t.slice(4), `l${i}`)}
            </p>
          );
        }
        if (t.startsWith("## ")) {
          return (
            <p key={i} className="text-[15px] font-semibold text-white">
              {renderInline(t.slice(3), `l${i}`)}
            </p>
          );
        }
        if (t.startsWith("# ")) {
          return (
            <p key={i} className="text-base font-bold text-white">
              {renderInline(t.slice(2), `l${i}`)}
            </p>
          );
        }

        if (/^[-*]\s+/.test(t)) {
          const inner = t.replace(/^[-*]\s+/, "");
          return (
            <p key={i} className="flex gap-2 pl-0.5">
              <span className="text-violet-400/80">•</span>
              <span>{renderInline(inner, `l${i}`)}</span>
            </p>
          );
        }

        return <p key={i}>{renderInline(t, `l${i}`)}</p>;
      })}
    </div>
  );
}
