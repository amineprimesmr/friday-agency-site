"use client";

import createGlobe, { type Marker } from "cobe";
import { useEffect, useRef } from "react";

import type { CountryCode, CountryRanking } from "@/lib/apple-charts";
import { COUNTRY_GLOBE_CENTROIDS } from "@/lib/country-globe-centroids";

function countryToGlobeAngles(lat: number, lng: number): { phi: number; theta: number } {
  return {
    phi: Math.PI - (lng * Math.PI) / 180 - Math.PI / 2,
    theta: (lat * Math.PI) / 180,
  };
}

function markerColor(rank: number | null, selected: boolean): [number, number, number] {
  if (selected) return [1, 1, 1];
  if (rank === null) return [0.35, 0.42, 0.48];
  if (rank <= 10) return [0.25, 0.95, 0.45];
  if (rank <= 50) return [0.18, 0.72, 0.38];
  return [0.12, 0.55, 0.32];
}

function markerSize(rank: number | null, selected: boolean): number {
  if (selected) return 0.12;
  if (rank === null) return 0.028;
  return Math.max(0.045, 0.11 - rank / 900);
}

function buildMarkers(
  rankings: readonly CountryRanking[],
  focusCountry: CountryCode | null,
): Marker[] {
  return rankings.map((r) => {
    const loc = COUNTRY_GLOBE_CENTROIDS[r.country];
    const selected = focusCountry === r.country;
    return {
      id: r.country,
      location: [loc[0], loc[1]],
      size: markerSize(r.rank, selected),
      color: markerColor(r.rank, selected),
    };
  });
}

type Props = Readonly<{
  rankings: readonly CountryRanking[];
  focusCountry: CountryCode | null;
  onFocusCountry: (code: CountryCode | null) => void;
}>;

export function TrackappCountryRankingsGlobe({ rankings, focusCountry, onFocusCountry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef(focusCountry);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractingMovement = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.28);
  const focusAnglesRef = useRef<{ phi: number; theta: number } | null>(null);

  useEffect(() => {
    focusRef.current = focusCountry;
    if (focusCountry) {
      const loc = COUNTRY_GLOBE_CENTROIDS[focusCountry];
      focusAnglesRef.current = countryToGlobeAngles(loc[0], loc[1]);
    } else {
      focusAnglesRef.current = null;
    }
  }, [focusCountry]);

  const rankingsRef = useRef(rankings);
  rankingsRef.current = rankings;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let width = canvas.parentElement?.offsetWidth ?? 400;

    const onResize = () => {
      width = canvas.parentElement?.offsetWidth ?? 400;
    };
    onResize();
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 20000,
      mapBrightness: 5.5,
      baseColor: [0.12, 0.14, 0.2],
      markerColor: [0.2, 0.85, 0.45],
      glowColor: [0.12, 0.28, 0.14],
      markers: buildMarkers(rankingsRef.current, focusRef.current),
      markerElevation: 0.04,
    });

    let frameId = 0;
    const tick = () => {
      const focus = focusRef.current;
      const target = focus ? focusAnglesRef.current : null;

      if (target && pointerInteracting.current === null) {
        const drift = 0.04;
        phiRef.current += (target.phi - phiRef.current) * drift;
        thetaRef.current += (target.theta - thetaRef.current) * drift;
      } else if (pointerInteracting.current === null) {
        phiRef.current += 0.004;
      } else {
        phiRef.current += pointerInteractingMovement.current / 200;
        pointerInteractingMovement.current *= 0.92;
      }

      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        width: width * 2,
        height: width * 2,
        markers: buildMarkers(rankingsRef.current, focus),
      });

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, []);

  return (
    <div className="trackapp-country-globe">
      <canvas
        ref={canvasRef}
        className="trackapp-country-globe__canvas"
        aria-hidden
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractingMovement.current;
          canvasRef.current?.setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            pointerInteractingMovement.current = e.clientX - pointerInteracting.current;
          }
        }}
      />
      <div className="trackapp-country-globe__chips" aria-hidden>
        {rankings
          .filter((r): r is CountryRanking & { rank: number } => r.rank !== null)
          .slice(0, 8)
          .map((r) => (
            <button
              key={r.country}
              type="button"
              className={`trackapp-country-globe__chip ${focusCountry === r.country ? "trackapp-country-globe__chip--active" : ""}`}
              onClick={() => onFocusCountry(focusCountry === r.country ? null : r.country)}
            >
              <span>{r.flag}</span>
              <span>#{r.rank}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
