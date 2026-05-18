"use client";

import { useEffect, useState } from "react";

import { formatShowcaseLastUpdatedLine } from "@/lib/tracker-showcase-last-updated";
import { cn } from "@/lib/utils";
import "@/styles/build-next-showcase.css";

function ShowcaseLastUpdatedRow({ className }: { className?: string }) {
  const [line, setLine] = useState("");

  useEffect(() => {
    setLine(formatShowcaseLastUpdatedLine());
  }, []);

  return (
    <div className={cn("build-next-hero-title__sub", className)}>
      <span className="build-next-hero-status-dot" aria-hidden />
      <span>Dernière mise à jour&nbsp;: {line || "\u00a0"}</span>
    </div>
  );
}

function ShowcaseWeeklySublineRow({ className }: { className?: string }) {
  return (
    <div className={cn("build-next-hero-title__sub", className)}>
      <span className="build-next-hero-status-dot" aria-hidden />
      <span>Mis à jour chaque semaine</span>
    </div>
  );
}

export type ShowcaseHeroHeaderProps = {
  /** Pour `aria-labelledby` de la section englobante */
  headingId: string;
  title: string;
  /** Sous-ligne façon titre intermédiaire (facultatif) */
  tagline?: string;
  /**
   * Sous-le-titre après le titre : date dynamique (showcase vidéos) ou rythme éditorial (grille Tracker).
   * @default "last-updated"
   */
  subFooter?: "last-updated" | "weekly";
  /** Place la ligne sous-footer au-dessus du titre (ex. « Dernière mise à jour » avant le H2). */
  subFooterPlacement?: "below" | "above";
  /** Ruban pleine viewport comme sous le hero tracker */
  bleed?: boolean;
  /** Affiche `[ badgeLabel ]` au-dessus du titre */
  showBracketBadge?: boolean;
  /** Libellé entre les crochets (espaces inclus pour le mono), défaut APPTRACKER */
  badgeLabel?: string;
  align?: "left" | "center";
  /** Classes additionnelles sur le `<header>` (ex. compact vertical). */
  className?: string;
};

export function ShowcaseHeroHeader({
  headingId,
  title,
  tagline,
  subFooter = "last-updated",
  subFooterPlacement = "below",
  bleed = true,
  showBracketBadge = true,
  badgeLabel = " APPTRACKER ",
  align = "left",
  className,
}: ShowcaseHeroHeaderProps) {
  const subAboveClass = subFooterPlacement === "above" ? "build-next-hero-title__sub--above-title" : undefined;

  const subRow =
    subFooter === "weekly" ? (
      <ShowcaseWeeklySublineRow className={subAboveClass} />
    ) : (
      <ShowcaseLastUpdatedRow className={subAboveClass} />
    );

  return (
    <header
      className={cn(
        "build-next-hero",
        !bleed && "build-next-hero--contained mb-7 sm:mb-9",
        align === "center" && "build-next-hero--align-center",
        className,
      )}
    >
      <div className="build-next-hero-inner">
        {showBracketBadge ? (
          <p className="tracker-bracket-badge tracker-bracket-badge--on-dark build-next-hero-kicker">
            <span className="tracker-bracket-badge__br" aria-hidden>
              [
            </span>
            <span className="tracker-bracket-badge__text">{badgeLabel}</span>
            <span className="tracker-bracket-badge__br" aria-hidden>
              ]
            </span>
          </p>
        ) : null}

        {subFooterPlacement === "above" ? subRow : null}

        <h2 id={headingId} className="build-next-hero-title">
          {title}
        </h2>

        {tagline ? <p className="build-next-hero-tagline">{tagline}</p> : null}

        {subFooterPlacement === "below" ? subRow : null}
      </div>
    </header>
  );
}
