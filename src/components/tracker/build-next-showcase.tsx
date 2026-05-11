"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import "@/styles/build-next-showcase.css";

const LABELS = [
  "Agence",
  "Jeu",
  "Entreprise de services",
  "Réseau social",
  "Plateforme de shopping",
] as const;

type PhoneCellProps = {
  label: string;
  src: string | null;
  reduceMotion: boolean | null;
};

const PHONE_SHELL =
  "relative mx-auto aspect-[9/19.5] max-w-full shrink-0 shadow-[0_22px_52px_rgba(0,0,0,.52)] ring-1 ring-white/[0.03] " +
  "w-[min(72vw,16rem)] max-w-[16rem] " +
  "sm:w-[min(62vw,17.75rem)] sm:max-w-[17.75rem] " +
  "md:w-full md:max-w-[22rem] md:shadow-[0_32px_76px_rgba(0,0,0,.58)] " +
  "lg:!w-[14.5rem] lg:!max-w-[14.5rem] lg:shadow-[0_26px_60px_rgba(0,0,0,.54)] " +
  "xl:!w-[16.25rem] xl:!max-w-[16.25rem] " +
  "2xl:!w-[17.75rem] 2xl:!max-w-[17.75rem]";

function PhoneCell({ label, src, reduceMotion }: PhoneCellProps) {
  return (
    <div className="flex w-[min(72vw,16rem)] max-w-[16rem] shrink-0 snap-center snap-always flex-col items-center gap-3 sm:w-[min(62vw,17.75rem)] sm:max-w-[17.75rem] sm:gap-4 md:!w-full md:!max-w-[22rem] lg:!w-auto lg:!max-w-none md:justify-self-center">
      <p className="max-w-[12rem] text-center text-xs font-medium leading-snug text-white/85 sm:max-w-[16rem] sm:text-sm md:text-base xl:max-w-[14rem] xl:text-[15px]">
        {label}
      </p>
      <div className={PHONE_SHELL}>
        <div
          className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-b from-white/[0.14] to-white/[0.04] p-[3px]"
          aria-hidden
        >
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-neutral-950 ring-1 ring-white/10">
            {src ? (
              reduceMotion ? (
                <video
                  className="h-full w-full object-cover"
                  src={src}
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={label}
                />
              ) : (
                <video
                  className="h-full w-full object-cover"
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={label}
                />
              )
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

export function BuildNextShowcase({ videoSrcs }: { videoSrcs: string[] }) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cells = LABELS.map((label, i) => ({
    label,
    src: videoSrcs[i] ?? null,
  }));

  useEffect(() => {
    if (reduceMotion) return;
    const el = scrollerRef.current;
    if (!el) return;

    const SPEED = 0.042; // px/ms ≈ 42px/s
    let rafId = 0;
    let lastTime: number | null = null;
    let paused = false;
    let running = false;

    const scrollEl = el;

    function isCarouselMode() {
      return scrollEl.scrollWidth > scrollEl.clientWidth + 6;
    }

    function tick(now: number) {
      if (!running) return;
      if (!paused && lastTime !== null) {
        const dt = Math.min(now - lastTime, 100);
        scrollEl.scrollLeft += SPEED * dt;
        if (scrollEl.scrollLeft >= scrollEl.scrollWidth - scrollEl.clientWidth - 1) {
          scrollEl.scrollLeft = 0;
        }
      }
      lastTime = paused ? null : now;
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      lastTime = null;
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (isCarouselMode()) start();
            else stop();
          })
        : null;
    ro?.observe(scrollEl);

    if (isCarouselMode()) start();

    const onTouchStart = () => { paused = true; };
    const onTouchEnd = () => { setTimeout(() => { paused = false; }, 600); };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") { paused = true; }
      else { paused = false; }
    };

    scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro?.disconnect();
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion, videoSrcs]);

  return (
    <section
      className="mt-14 border-t border-white/[0.06] pt-14 sm:mt-16 sm:pt-16"
      aria-labelledby="build-next-heading"
    >
      <h2
        id="build-next-heading"
        className="mx-auto max-w-3xl px-2 text-center text-[clamp(1.75rem,5.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white"
      >
        Notre sélection de la semaine
      </h2>

      <div className="mt-10 lg:mt-14">
        <div
          ref={scrollerRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Exemples d’applications en vidéo"
          className="build-next-scroller -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-5 pb-4 pt-1 scroll-auto md:scroll-smooth sm:-mx-6 sm:gap-8 sm:px-7 md:mx-0 md:grid md:w-full md:max-w-none md:grid-cols-2 md:justify-items-center md:gap-x-8 md:gap-y-12 md:overflow-visible md:px-0 md:pb-8 md:snap-none md:pt-0 lg:grid-cols-5 lg:gap-x-2 lg:gap-y-8 xl:gap-x-4 2xl:gap-x-5"
        >
          {cells.map((cell) => (
            <PhoneCell key={cell.label} label={cell.label} src={cell.src} reduceMotion={reduceMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
