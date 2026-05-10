"use client";

import { useState } from "react";
import Image from "next/image";

export function AppScreenshots({
  urls,
  ipadUrls = [],
}: {
  urls: string[];
  ipadUrls?: string[];
}) {
  const [active, setActive] = useState<"iphone" | "ipad">("iphone");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const shots = active === "iphone" ? urls : ipadUrls;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Captures d&apos;écran · App Store
        </h2>
        {ipadUrls.length > 0 && (
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {(["iphone", "ipad"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`px-3 py-1 text-[11px] font-medium transition ${
                  active === t
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "iphone" ? "iPhone" : "iPad"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
        {shots.slice(0, 8).map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(url)}
            className="group relative h-[280px] w-[130px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 transition hover:ring-white/30"
          >
            <Image
              src={url}
              alt={`Screenshot ${i + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="130px"
              unoptimized
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl">
            <Image
              src={lightbox}
              alt="Screenshot"
              width={400}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
              unoptimized
            />
          </div>
          <button
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
