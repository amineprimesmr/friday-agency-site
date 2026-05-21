"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = Readonly<{
  urls: string[];
  title?: string;
  embedded?: boolean;
}>;

export function TrackappAppStoreScreenshots({
  urls,
  title = "Captures App Store",
  embedded = false,
}: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!urls.length) return null;

  const track = (
    <div className={cn(embedded ? "ta-detail-screenshots" : "mt-4 max-w-full overflow-x-auto pb-1")}>
      <ul className={cn("m-0 flex list-none gap-3 p-0", embedded && "ta-detail-screenshots__track")}>
        {urls.map((url, i) => (
          <li key={url} className="shrink-0">
            <button
              type="button"
              onClick={() => setLightbox(url)}
              className={cn(
                "block overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/60",
                embedded
                  ? "ta-detail-screenshot-btn"
                  : "rounded-xl border border-slate-200 bg-slate-100 ring-1 ring-slate-200/80 transition hover:border-slate-300 hover:shadow-md",
              )}
            >
              <div className="relative h-[168px] w-[78px] sm:h-[178px] sm:w-[82px]">
                <Image
                  src={url}
                  alt={`Capture App Store ${i + 1}`}
                  fill
                  className="object-cover object-top"
                  sizes="82px"
                  unoptimized
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  if (embedded) {
    return (
      <>
        {track}
        {lightbox ? <Lightbox url={lightbox} onClose={() => setLightbox(null)} /> : null}
      </>
    );
  }

  return (
    <section className="mt-5 rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
      <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">{title}</h2>
      {track}
      {lightbox ? <Lightbox url={lightbox} onClose={() => setLightbox(null)} /> : null}
    </section>
  );
}

function Lightbox({ url, onClose }: Readonly<{ url: string; onClose: () => void }>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="relative max-h-[min(90vh,720px)] max-w-[min(90vw,400px)] overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={url}
          alt="Capture App Store agrandie"
          width={400}
          height={800}
          className="h-auto max-h-[min(90vh,720px)] w-auto object-contain"
          unoptimized
        />
      </div>
      <button
        type="button"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
        onClick={onClose}
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}
