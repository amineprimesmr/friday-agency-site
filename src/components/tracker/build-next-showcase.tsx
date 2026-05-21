"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

import { ShowcaseHeroHeader } from "@/components/tracker/showcase-hero-header";
import { useMobilePerf } from "@/lib/use-coarse-pointer";
import type { AppShowcaseVideoItemEnriched } from "@/lib/showcase-app-videos-enrich";
import { cn } from "@/lib/utils";

import "@/styles/build-next-showcase.css";

const DESKTOP_SLOT_COUNT = 5;
const MOBILE_SLOT_COUNT = 3;
const MARQUEE_PX_PER_MS = 0.048;

type PhoneSlideProps = {
  ariaLabel: string;
  item: AppShowcaseVideoItemEnriched | null;
  mobilePerf: boolean;
};

const PHONE_FRAME =
  "relative mx-auto aspect-[9/19.5] w-[min(78vw,15.5rem)] max-w-[15.5rem] shrink-0 " +
  "shadow-[0_20px_48px_rgba(0,0,0,.5)] ring-1 ring-white/[0.04] sm:w-[15.25rem]";

function PhoneSlide({ ariaLabel, item, mobilePerf }: PhoneSlideProps) {
  const src = item?.src ?? null;
  const title = item?.displayName ?? null;
  const artworkUrl = item?.artworkUrl ?? null;
  const posterSrc = item?.posterSrc ?? null;
  const moneyLine = item?.monthlyRevenueLabel ?? null;

  return (
    <div className="build-next-carousel__slide flex shrink-0 flex-col items-center">
      <div className={PHONE_FRAME}>
        <div
          className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-b from-white/[0.14] to-white/[0.04] p-[3px]"
          aria-hidden
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-neutral-950 ring-1 ring-white/10">
            {src && !mobilePerf ? (
              <>
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={src}
                  poster={posterSrc ?? undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={ariaLabel}
                />
                {moneyLine != null && artworkUrl != null && title != null ? (
                  <VideoFoot moneyLine={moneyLine} artworkUrl={artworkUrl} title={title} />
                ) : null}
              </>
            ) : posterSrc ? (
              <>
                <Image
                  src={posterSrc}
                  alt=""
                  fill
                  sizes="248px"
                  className="object-cover"
                  aria-label={ariaLabel}
                />
                {moneyLine != null && artworkUrl != null && title != null ? (
                  <VideoFoot moneyLine={moneyLine} artworkUrl={artworkUrl} title={title} />
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

function VideoFoot({
  moneyLine,
  artworkUrl,
  title,
}: {
  moneyLine: string;
  artworkUrl: string;
  title: string;
}) {
  return (
    <div className="build-next-video-foot pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <div className="build-next-video-foot__gradient" aria-hidden />
      <div className="build-next-video-foot__content">
        <div className="build-next-video-foot__head">
          <span className="build-next-video-foot__icon-ring">
            <Image src={artworkUrl} alt="" fill className="object-cover" sizes="40px" />
          </span>
          <p className="build-next-video-foot__title">{title}</p>
        </div>
        <div>
          <p className="build-next-video-foot__money">{moneyLine}</p>
        </div>
      </div>
    </div>
  );
}

export function BuildNextShowcase({ videos }: { videos: AppShowcaseVideoItemEnriched[] }) {
  const mobilePerf = useMobilePerf();
  const trackRef = useRef<HTMLDivElement>(null);

  const slotCount = mobilePerf ? MOBILE_SLOT_COUNT : DESKTOP_SLOT_COUNT;

  const slides = useMemo(() => {
    return Array.from({ length: slotCount }, (_, i) => ({
      key: i,
      item: videos[i] ?? null,
      ariaLabel: videos[i]?.displayName ? `Vidéo ${videos[i]!.displayName}` : `Vidéo exemple ${i + 1}`,
    }));
  }, [videos, slotCount]);

  const loop = !mobilePerf;
  const trackSlides = loop ? [...slides, ...slides] : slides;

  useEffect(() => {
    if (!loop) return;
    const track = trackRef.current;
    if (!track) return;
    const el = track;

    let rafId = 0;
    let lastTime: number | null = null;
    let paused = true;
    let inViewport = !("IntersectionObserver" in window);

    const loopLength = () => {
      const w = el.scrollWidth;
      return w > 0 ? w / 2 : 0;
    };

    function tick(now: number) {
      rafId = 0;
      const half = loopLength();
      if (half <= 40 || paused) {
        lastTime = null;
        return;
      }
      if (lastTime === null) {
        lastTime = now;
        rafId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(now - lastTime, 64);
      el.scrollLeft += MARQUEE_PX_PER_MS * dt;
      if (el.scrollLeft >= half - 2) el.scrollLeft -= half;
      lastTime = now;
      rafId = requestAnimationFrame(tick);
    }

    const pause = () => {
      paused = true;
      lastTime = null;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const resume = () => {
      paused = false;
      lastTime = null;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onPointerDown = () => pause();
    const onPointerUp = () =>
      window.setTimeout(() => {
        if (inViewport && document.visibilityState === "visible") resume();
      }, 400);

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              inViewport = Boolean(entry?.isIntersecting);
              if (inViewport && document.visibilityState === "visible") resume();
              else pause();
            },
            { rootMargin: "120px 0px", threshold: 0.01 },
          )
        : null;
    io?.observe(el);
    if (!io) resume();

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      io?.disconnect();
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
          aria-label={
            mobilePerf
              ? "Exemples d’applications — faites glisser horizontalement"
              : "Exemples d’applications en vidéo, défilant automatiquement"
          }
          tabIndex={0}
          className={cn(
            "build-next-carousel__track -mx-4 overscroll-x-contain px-5 sm:-mx-6 sm:px-7 md:mx-0 md:px-1",
            loop ? "overflow-x-hidden" : "build-next-carousel__track--touch overflow-x-auto",
          )}
        >
          {trackSlides.map((s, idx) => (
            <PhoneSlide
              key={loop ? `m-${idx}-${s.key}` : `${s.key}`}
              ariaLabel={s.ariaLabel}
              item={s.item}
              mobilePerf={mobilePerf}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
