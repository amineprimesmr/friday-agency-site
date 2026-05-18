"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { ShowcaseHeroHeader } from "@/components/tracker/showcase-hero-header";
import type { AppShowcaseVideoItemEnriched } from "@/lib/showcase-app-videos-enrich";
import { formatShowcaseLastUpdatedLine } from "@/lib/tracker-showcase-last-updated";
import { cn } from "@/lib/utils";

import "@/styles/build-next-showcase.css";

const SLOT_COUNT = 5;
/** Vitesse de défilement (px / ms). ~0.048 ≈ 48 px/s */
const MARQUEE_PX_PER_MS = 0.048;

type PhoneSlideProps = {
  ariaLabel: string;
  item: AppShowcaseVideoItemEnriched | null;
  reduceMotion: boolean | null;
};

/** Une largeur lisible pour toutes les tailles — toujours en ruban horizontal */
const PHONE_FRAME =
  "relative mx-auto aspect-[9/19.5] w-[min(78vw,15.5rem)] max-w-[15.5rem] shrink-0 " +
  "shadow-[0_20px_48px_rgba(0,0,0,.5)] ring-1 ring-white/[0.04] sm:w-[15.25rem]";

function VideoFootLastUpdated() {
  const [line, setLine] = useState("");

  useEffect(() => {
    setLine(formatShowcaseLastUpdatedLine());
  }, []);

  return (
    <p className="build-next-video-foot__updated">
      <span className="build-next-video-foot__status-dot" aria-hidden />
      <span>Dernière mise à jour&nbsp;: {line || "\u00a0"}</span>
    </p>
  );
}

function PhoneSlide({ ariaLabel, item, reduceMotion }: PhoneSlideProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [mediaActive, setMediaActive] = useState(false);
  const src = item?.src ?? null;
  const title = item?.displayName ?? null;
  const artworkUrl = item?.artworkUrl ?? null;

  const moneyLine = item?.monthlyRevenueLabel ?? null;

  useEffect(() => {
    if (mediaActive) return;
    const el = frameRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setMediaActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setMediaActive(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mediaActive]);

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div ref={frameRef} className={PHONE_FRAME}>
        <div
          className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-b from-white/[0.14] to-white/[0.04] p-[3px]"
          aria-hidden
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-neutral-950 ring-1 ring-white/10">
            {src ? (
              <>
                {!mediaActive ? (
                  <div className="absolute inset-0 h-full w-full bg-neutral-950" aria-label={ariaLabel} />
                ) : reduceMotion ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={src}
                    muted
                    playsInline
                    preload="none"
                    aria-label={ariaLabel}
                  />
                ) : (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={ariaLabel}
                  />
                )}
                {moneyLine != null && artworkUrl != null && title != null ? (
                  <div className="build-next-video-foot pointer-events-none absolute inset-x-0 bottom-0 z-10">
                    <div className="build-next-video-foot__gradient" aria-hidden />
                    <div className="build-next-video-foot__content">
                      <div className="build-next-video-foot__head">
                        <span className="build-next-video-foot__icon-ring">
                          <Image
                            src={artworkUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </span>
                        <p className="build-next-video-foot__title">{title}</p>
                      </div>
                      <div>
                        <p className="build-next-video-foot__money">{moneyLine}</p>
                      </div>
                      <VideoFootLastUpdated />
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/[0.04] px-3 text-center">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">Vidéo</span>
                <span className="text-[11px] leading-relaxed text-white/35">
                  Déposez un fichier .mp4 ou .webm dans{" "}
                  <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px] text-white/50">public/assets/appvideo</code>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuildNextShowcase({ videos }: { videos: AppShowcaseVideoItemEnriched[] }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  const slides = useMemo(() => {
    return Array.from({ length: SLOT_COUNT }, (_, i) => ({
      key: i,
      item: videos[i] ?? null,
      ariaLabel: videos[i]?.displayName ? `Vidéo ${videos[i]!.displayName}` : `Vidéo exemple ${i + 1}`,
    }));
  }, [videos]);

  const loop = Boolean(!reduceMotion);
  /** Deuxième copie permet un saut sans couture quand scrollLeft atteint la moitié */
  const trackSlides = loop ? [...slides, ...slides] : slides;

  useEffect(() => {
    if (!loop) return;
    const track = trackRef.current;
    if (!track) return;
    const el = track;

    let rafId = 0;
    let lastTime: number | null = null;
    let paused = false;

    const loopLength = () => {
      const w = el.scrollWidth;
      if (w <= 0) return 0;
      return w / 2;
    };

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      const half = loopLength();
      if (half <= 40 || paused) {
        lastTime = null;
        return;
      }
      if (lastTime === null) {
        lastTime = now;
        return;
      }
      const dt = Math.min(now - lastTime, 64);
      el.scrollLeft += MARQUEE_PX_PER_MS * dt;
      if (el.scrollLeft >= half - 2) el.scrollLeft -= half;
      lastTime = now;
    }

    rafId = requestAnimationFrame(tick);

    const pause = () => {
      paused = true;
      lastTime = null;
    };
    const resume = () => {
      paused = false;
      lastTime = null;
    };

    const onPointerDown = () => pause();
    const onPointerUp = () => window.setTimeout(resume, 400);
    const onVisibility = () => {
      paused = document.visibilityState !== "visible";
      lastTime = null;
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    track.addEventListener("touchstart", onPointerDown, { passive: true });
    track.addEventListener("touchend", onPointerUp, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            const h = loopLength();
            if (h > 40 && el.scrollLeft >= h - 8) el.scrollLeft -= h;
          })
        : null;
    ro?.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      track.removeEventListener("touchstart", onPointerDown);
      track.removeEventListener("touchend", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      ro?.disconnect();
    };
  }, [loop]);

  return (
    <section className="mt-6 pt-4 sm:mt-8 sm:pt-5" aria-labelledby="build-next-heading">
      <ShowcaseHeroHeader
        headingId="build-next-heading"
        title="Construisez le prochain…"
        bleed
        showBracketBadge={false}
        subFooterPlacement="above"
        className="build-next-hero--compact-carousel"
      />

      <div className="build-next-carousel mt-4 sm:mt-5 lg:mt-6">
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Exemples d’applications en vidéo, défilant automatiquement"
          tabIndex={0}
          className={cn(
            "build-next-carousel__track -mx-4 overscroll-x-contain px-5 sm:-mx-6 sm:px-7 md:mx-0 md:px-1",
            loop ? "overflow-x-hidden" : "overflow-x-auto",
          )}
          data-marquee-loop={loop ? "true" : "false"}
        >
          {trackSlides.map((s, idx) => (
            <PhoneSlide
              key={loop ? `m-${idx}-${s.key}` : `${s.key}`}
              ariaLabel={s.ariaLabel}
              item={s.item}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
