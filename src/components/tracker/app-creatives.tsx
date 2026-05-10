"use client";

import { useState } from "react";
import Image from "next/image";

const FORMATS = [
  { id: "story", label: "Story 9:16", w: 90, h: 160 },
  { id: "square", label: "Square 1:1", w: 130, h: 130 },
  { id: "banner", label: "Banner 16:9", w: 220, h: 124 },
] as const;

type FormatId = (typeof FORMATS)[number]["id"];

export function AppCreatives({
  appName,
  urls,
}: {
  appName: string;
  urls: string[];
}) {
  const [format, setFormat] = useState<FormatId>("story");
  const fmt = FORMATS.find((f) => f.id === format)!;

  if (!urls.length) return null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Creatives · Assets publicitaires
          </h2>
          <p className="mt-0.5 text-[11px] text-white/30">
            Captures utilisées comme visuels App Store
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-white/10">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`px-3 py-1 text-[11px] font-medium transition ${
                format === f.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {urls.slice(0, 6).map((url, i) => (
          <div key={i} className="group relative flex flex-col items-center gap-2">
            <div
              className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 transition group-hover:ring-white/25"
              style={{ width: fmt.w, height: fmt.h }}
            >
              <Image
                src={url}
                alt={`${appName} creative ${i + 1}`}
                fill
                className="object-cover"
                sizes={`${fmt.w}px`}
                unoptimized
              />
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-transparent pb-2 opacity-0 transition group-hover:opacity-100">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  ↓ Télécharger
                </a>
              </div>
            </div>
            <span className="text-[10px] text-white/30">#{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Acquisition channels estimate */}
      <div className="mt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Canaux d&apos;acquisition estimés
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Apple Search Ads", icon: "🍎", color: "bg-white/[0.05]" },
            { name: "App Store Organic", icon: "📱", color: "bg-white/[0.05]" },
            { name: "Social Media Ads", icon: "📣", color: "bg-white/[0.05]" },
            { name: "Word of Mouth", icon: "💬", color: "bg-white/[0.05]" },
          ].map((ch) => (
            <div
              key={ch.name}
              className={`flex items-center gap-2 rounded-full border border-white/[0.06] ${ch.color} px-3 py-1.5`}
            >
              <span className="text-sm">{ch.icon}</span>
              <span className="text-xs text-white/60">{ch.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/25">
          Estimations basées sur la présence dans les classements et la catégorie de l&apos;app.
        </p>
      </div>
    </div>
  );
}
