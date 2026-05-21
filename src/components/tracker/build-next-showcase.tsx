"use client";

import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ShowcaseAppIcon } from "@/components/tracker/showcase-app-icon";
import { ShowcaseHeroHeader } from "@/components/tracker/showcase-hero-header";
import { useTouchDevice } from "@/lib/use-touch-device";
import type { AppShowcaseVideoItemEnriched } from "@/lib/showcase-app-videos-types";
import { cn } from "@/lib/utils";

import "@/styles/build-next-showcase.css";

const MARQUEE_PX_PER_SEC = 170;
const MARQUEE_PX_PER_SEC_TOUCH = 140;

type PhoneSlideProps = {
  ariaLabel: string;
  item: AppShowcaseVideoItemEnriched | null;
  reduceMotion: boolean | null;
};

const PHONE_FRAME_DEFAULT =
  "relative mx-auto aspect-[9/19.5] w-[min(78vw,18rem)] max-w-[18rem] shrink-0 " +
  "shadow-[0_20px_48px_rgba(0,0,0,.5)] ring-1 ring-white/[0.04] sm:w-[17.5rem]";

const PHONE_FRAME_COMPACT =
  "relative mx-auto aspect-[9/19.5] w-[min(42vw,13rem)] max-w-[13rem] shrink-0 " +
  "shadow-[0_16px_40px_rgba(0,0,0,.45)] ring-1 ring-white/[0.06] sm:w-[12.5rem]";

function PhoneSlide({
  ariaLabel,
  item,
  reduceMotion,
  compact = false,
}: PhoneSlideProps & { compact?: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = item?.src ?? null;
  const title = item?.displayName ?? null;
  const artworkUrl = item?.artworkUrl ?? null;
  const iconSrc = item?.iconSrc ?? null;
  const posterSrc = item?.posterSrc ?? null;
  const moneyLine = item?.monthlyRevenueLabel ?? null;

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video || !src) return;

    let shouldPlay = false;

    const syncPlayback = () => {
      if (!shouldPlay || reduceMotion) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    if (!("IntersectionObserver" in window)) {
      shouldPlay = true;
      syncPlayback();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        shouldPlay = Boolean(entry?.isIntersecting && (entry.intersectionRatio ?? 0) > 0.12);
        syncPlayback();
      },
      { rootMargin: "100px 0px", threshold: [0, 0.12, 0.35] },
    );

    observer.observe(frame);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reduceMotion, src]);

  return (
    <div className="build-next-carousel__slide flex shrink-0 flex-col items-center">
      <div ref={frameRef} className={compact ? PHONE_FRAME_COMPACT : PHONE_FRAME_DEFAULT}>
        <div
          className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-b from-white/[0.14] to-white/[0.04] p-[3px]"
          aria-hidden
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-neutral-950 ring-1 ring-white/10">
            {src ? (
              <>
                <video
                  ref={videoRef}
                  className="build-next-carousel__video absolute inset-0 h-full w-full object-cover"
                  src={src}
                  poster={posterSrc ?? undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={ariaLabel}
                />
                {moneyLine != null && title != null ? (
                  <div className="build-next-video-foot pointer-events-none absolute inset-x-0 bottom-0 z-10">
                    <div className="build-next-video-foot__gradient" aria-hidden />
                    <div className="build-next-video-foot__content">
                      <div className="build-next-video-foot__head">
                        <span className="build-next-video-foot__icon-ring">
                          <ShowcaseAppIcon
                            artworkUrl={artworkUrl}
                            iconSrc={iconSrc}
                            name={title}
                            priority={false}
                          />
                        </span>
                        <p className="build-next-video-foot__title">{title}</p>
                      </div>
                      <div>
                        <p className="build-next-video-foot__money">{moneyLine}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/[0.04] px-3 text-center">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">Vidéo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuildNextShowcaseCarousel({
  videos,
  className,
  compact = false,
  ariaLabel = "Exemples d’applications en vidéo, défilant automatiquement",
}: {
  videos: AppShowcaseVideoItemEnriched[];
  className?: string;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const touch = useTouchDevice();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [marqueePaused, setMarqueePaused] = useState(false);

  const slides = useMemo(() => {
    const count = Math.max(videos.length, 1);
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      item: videos[i] ?? null,
      ariaLabel: videos[i]?.displayName ? `Vidéo ${videos[i]!.displayName}` : `Vidéo exemple ${i + 1}`,
    }));
  }, [videos]);

  const loop = !reduceMotion && slides.length > 1;
  const trackSlides = loop ? [...slides, ...slides] : slides;
  const pxPerSec = touch ? MARQUEE_PX_PER_SEC_TOUCH : MARQUEE_PX_PER_SEC;
  const marqueeDurationSec = useMemo(() => {
    const slideWidth = compact ? 208 : 288;
    const gap = compact ? 14 : 22;
    const loopWidth = slides.length * slideWidth + Math.max(0, slides.length - 1) * gap;
    return Math.max(18, loopWidth / pxPerSec);
  }, [compact, pxPerSec, slides.length]);

  useEffect(() => {
    if (!loop) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const syncPaused = (paused: boolean) => setMarqueePaused(paused);

    const onVis = () => {
      if (document.visibilityState !== "visible") syncPaused(true);
      else syncPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => syncPaused(!entry?.isIntersecting),
            { rootMargin: "120px 0px", threshold: 0.01 },
          )
        : null;
    io?.observe(viewport);
    onVis();

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [loop]);

  return (
    <div className={cn("build-next-carousel build-next-carousel--edge", className)}>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className={cn(
          "build-next-carousel__viewport",
          loop ? "build-next-carousel__viewport--marquee" : "build-next-carousel__viewport--scroll",
        )}
      >
        <div
          className={cn(
            "build-next-carousel__track-inner",
            loop && "build-next-carousel__track-inner--marquee",
            loop && marqueePaused && "build-next-carousel__track-inner--paused",
          )}
          style={loop ? ({ "--marquee-duration": `${marqueeDurationSec}s` } as CSSProperties) : undefined}
        >
          {trackSlides.map((s, idx) => (
            <PhoneSlide
              key={loop ? `m-${idx}-${s.key}` : `${s.key}`}
              ariaLabel={s.ariaLabel}
              item={s.item}
              reduceMotion={reduceMotion}
              compact={compact}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BuildNextShowcase({ videos }: { videos: AppShowcaseVideoItemEnriched[] }) {
  return (
    <section className="mt-6 pt-4 sm:mt-8 sm:pt-5" aria-labelledby="build-next-heading">
      <ShowcaseHeroHeader
        headingId="build-next-heading"
        title="Créez le prochain…"
        bleed
        align="center"
        showBracketBadge={false}
        subFooterPlacement="above"
        titleClassName="build-next-hero-title--fintap-match"
        className="build-next-hero--compact-carousel"
      />

      <BuildNextShowcaseCarousel videos={videos} className="mt-4 sm:mt-5 lg:mt-6" />
    </section>
  );
}
