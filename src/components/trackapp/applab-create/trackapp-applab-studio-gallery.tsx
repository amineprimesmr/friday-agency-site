"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ShowcaseLastUpdatedSubline } from "@/components/tracker/showcase-hero-header";
import { TrackerLandingHeroTitle } from "@/components/tracker/tracker-landing-hero-title";
import { ShowcaseAppIcon } from "@/components/tracker/showcase-app-icon";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";
import type { AppShowcaseVideoItemEnriched } from "@/lib/showcase-app-videos-types";
import { cn } from "@/lib/utils";

import "@/styles/build-next-showcase.css";

function FormatVideoCard({
  item,
  reduceMotion,
}: Readonly<{
  item: AppShowcaseVideoItemEnriched;
  reduceMotion: boolean | null;
}>) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const href = trackappAccueilAppHref(item.appStoreId, "fr");

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video || !item.src) return;

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
      return () => video.pause();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        shouldPlay = Boolean(entry?.isIntersecting && (entry.intersectionRatio ?? 0) > 0.08);
        syncPlayback();
      },
      { rootMargin: "120px 0px", threshold: [0, 0.08, 0.2] },
    );

    observer.observe(card);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [item.src, reduceMotion]);

  return (
    <article
      ref={cardRef}
      className={cn("ta-applab-format-card", hovered && "is-hovered")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false);
      }}
    >
      <div className="ta-applab-iphone">
        <div className="ta-applab-iphone__device">
          <span className="ta-applab-iphone__btn ta-applab-iphone__btn--silent" aria-hidden />
          <span className="ta-applab-iphone__btn ta-applab-iphone__btn--volume" aria-hidden />

          <div className="ta-applab-iphone__screen">
            <span className="ta-applab-iphone__island" aria-hidden />

            <video
              ref={videoRef}
              className="ta-applab-format-card__video"
              src={item.src}
              poster={item.posterSrc}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              aria-label={`Vidéo ${item.displayName}`}
            />

            <div className="ta-applab-format-foot pointer-events-none">
              <div className="ta-applab-format-foot__gradient" aria-hidden />
              <div className="ta-applab-format-foot__content">
                <div className="ta-applab-format-foot__head">
                  <span className="ta-applab-format-foot__icon">
                    <ShowcaseAppIcon
                      artworkUrl={item.artworkUrl}
                      iconSrc={item.iconSrc}
                      name={item.displayName}
                    />
                  </span>
                  <p className="ta-applab-format-foot__title">{item.displayName}</p>
                </div>
                {item.monthlyRevenueLabel ? (
                  <p className="ta-applab-format-foot__money">{item.monthlyRevenueLabel}</p>
                ) : null}
              </div>
            </div>

            <div className="ta-applab-format-card__shade" aria-hidden />

            <div className="ta-applab-format-card__cta-wrap">
              <Link href={href} className="ta-applab-format-card__cta" prefetch>
                Tracker
              </Link>
            </div>

            <span className="ta-applab-iphone__home-indicator" aria-hidden />
          </div>
        </div>
      </div>
    </article>
  );
}

export function TrackappApplabStudioGallery({
  videos,
}: Readonly<{
  videos: AppShowcaseVideoItemEnriched[];
}>) {
  const reduceMotion = useReducedMotion();
  const items = videos;

  if (items.length === 0) return null;

  return (
    <section id="selection" className="ta-applab-studio__gallery" aria-labelledby="ta-applab-studio-gallery-heading">
      <div className="ta-applab-studio__gallery-heading">
        <TrackerLandingHeroTitle as="h2" id="ta-applab-studio-gallery-heading">
          Trouvez les meilleures apps à copier
        </TrackerLandingHeroTitle>
        <ShowcaseLastUpdatedSubline className="ta-applab-studio__gallery-updated" />
      </div>

      <div className="ta-applab-format-grid-outer">
        <div className="ta-applab-format-grid" role="list">
          {items.map((item) => (
            <FormatVideoCard
              key={item.appStoreId}
              item={item}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
