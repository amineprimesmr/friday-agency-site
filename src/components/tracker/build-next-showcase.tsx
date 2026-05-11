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
  "w-[min(62vw,13.75rem)] max-w-[13.75rem] " +
  "sm:w-[min(56vw,15.25rem)] sm:max-w-[15.25rem] " +
  "md:w-full md:max-w-[19rem] md:shadow-[0_32px_76px_rgba(0,0,0,.58)] " +
  "lg:!w-[11.75rem] lg:!max-w-[11.75rem] lg:shadow-[0_26px_60px_rgba(0,0,0,.54)] " +
  "xl:!w-[13.75rem] xl:!max-w-[13.75rem] " +
  "2xl:!w-[15rem] 2xl:!max-w-[15rem]";

function PhoneCell({ label, src, reduceMotion }: PhoneCellProps) {
  return (
    <div className="flex w-[min(62vw,13.75rem)] max-w-[13.75rem] shrink-0 snap-center snap-always flex-col items-center gap-3 sm:w-[min(56vw,15.25rem)] sm:max-w-[15.25rem] sm:gap-4 md:!w-full md:!max-w-[19rem] lg:!w-auto lg:!max-w-none md:justify-self-center">
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

    const mq = window.matchMedia("(max-width: 767.98px)");
    let tick = 0;

    function strideFor(el: HTMLElement): number {
      const a = el.children[0] as HTMLElement | undefined;
      const b = el.children[1] as HTMLElement | undefined;
      if (!a) return 0;
      if (b) return b.offsetLeft - a.offsetLeft;
      return a.getBoundingClientRect().width + 24;
    }

    function advance() {
      const el = scrollerRef.current;
      if (!el || !mq.matches) return;
      const stride = strideFor(el);
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (stride <= 0 || maxScroll <= 16) return;

      const next = el.scrollLeft + stride;
      /* `instant` évite le scroll CSS smooth (scroll-smooth/md) qui rivalise avec snap + vidéo. */
      if (next >= maxScroll - 12) {
        el.scrollTo({ left: 0, behavior: "instant" });
      } else {
        el.scrollTo({ left: next, behavior: "instant" });
      }
    }

    function stop() {
      if (tick !== 0) {
        window.clearInterval(tick);
        tick = 0;
      }
    }

    function start() {
      stop();
      if (!mq.matches) return;
      tick = window.setInterval(advance, 4300);
    }

    function onMqChange() {
      stop();
      queueMicrotask(start);
    }

    start();
    mq.addEventListener("change", onMqChange);

    return () => {
      stop();
      mq.removeEventListener("change", onMqChange);
    };
  }, [reduceMotion]);

  return (
    <section
      className="mt-14 border-t border-white/[0.06] pt-14 sm:mt-16 sm:pt-16"
      aria-labelledby="build-next-heading"
    >
      <h2
        id="build-next-heading"
        className="mx-auto max-w-3xl px-2 text-center text-[clamp(1.75rem,5.5vw,2.75rem)] font-semibold tracking-[-0.03em] text-white"
      >
        Construisez le suivant…
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
