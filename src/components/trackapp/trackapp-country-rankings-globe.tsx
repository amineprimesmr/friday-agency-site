"use client";

import createGlobe, { type Marker } from "cobe";
import { useEffect, useRef } from "react";

import type { CountryCode, CountryRanking } from "@/lib/apple-charts";
import { COUNTRY_GLOBE_CENTROIDS } from "@/lib/country-globe-centroids";

const GLOBE_SIZE = 300;
const GLOBE_DPR =
  typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
const FRAME_MS = 1000 / 24;

function countryToGlobeAngles(lat: number, lng: number): { phi: number; theta: number } {
  return {
    phi: Math.PI - (lng * Math.PI) / 180 - Math.PI / 2,
    theta: (lat * Math.PI) / 180,
  };
}

function markerColor(
  rank: number | null,
  selected: boolean,
  storeAvailable?: boolean,
  isTopMarket?: boolean,
): [number, number, number] {
  if (selected) return [1, 1, 1];
  if (rank !== null) {
    if (rank <= 10) return [0.25, 0.95, 0.45];
    if (rank <= 50) return [0.18, 0.72, 0.38];
    return [0.12, 0.55, 0.32];
  }
  if (isTopMarket) return [0.95, 0.78, 0.2];
  if (storeAvailable) return [0.35, 0.55, 0.95];
  return [0.28, 0.32, 0.38];
}

function markerSize(
  rank: number | null,
  selected: boolean,
  isTopMarket?: boolean,
  storeAvailable?: boolean,
): number {
  if (selected) return 0.12;
  if (rank !== null) return Math.max(0.045, 0.11 - rank / 900);
  if (isTopMarket) return 0.055;
  if (storeAvailable) return 0.04;
  return 0.024;
}

function buildMarkers(
  rankings: readonly CountryRanking[],
  focusCountry: CountryCode | null,
): Marker[] {
  return rankings
    .filter((r) => COUNTRY_GLOBE_CENTROIDS[r.country])
    .map((r) => {
      const loc = COUNTRY_GLOBE_CENTROIDS[r.country];
      const selected = focusCountry === r.country;
      return {
        location: [loc[0], loc[1]],
        size: markerSize(r.rank, selected, r.isTopMarket, r.storeAvailable),
        color: markerColor(r.rank, selected, r.storeAvailable, r.isTopMarket),
      };
    });
}

type Props = Readonly<{
  rankings: readonly CountryRanking[];
  focusCountry: CountryCode | null;
  onFocusCountry: (code: CountryCode | null) => void;
}>;

export function TrackappCountryRankingsGlobe({ rankings, focusCountry, onFocusCountry }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
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
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;

    const pixelSize = Math.round(GLOBE_SIZE * GLOBE_DPR);
    canvas.width = pixelSize;
    canvas.height = pixelSize;

    let visible = false;
    let frameId = 0;
    let lastTick = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: GLOBE_DPR,
      width: pixelSize,
      height: pixelSize,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 5_000,
      mapBrightness: 5,
      baseColor: [0.12, 0.14, 0.2],
      markerColor: [0.2, 0.85, 0.45],
      glowColor: [0.12, 0.28, 0.14],
      markers: buildMarkers(rankingsRef.current, focusRef.current),
      markerElevation: 0.04,
    });

    const tick = (now: number) => {
      if (!visible) return;

      if (now - lastTick < FRAME_MS) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      lastTick = now;

      const focus = focusRef.current;
      const target = focus ? focusAnglesRef.current : null;

      if (target && pointerInteracting.current === null) {
        phiRef.current += (target.phi - phiRef.current) * 0.05;
        thetaRef.current += (target.theta - thetaRef.current) * 0.05;
      } else if (pointerInteracting.current === null) {
        phiRef.current += 0.003;
      } else {
        phiRef.current += pointerInteractingMovement.current / 220;
        pointerInteractingMovement.current *= 0.9;
      }

      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        markers: buildMarkers(rankingsRef.current, focus),
      });

      frameId = requestAnimationFrame(tick);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry?.isIntersecting ?? false;
        if (nextVisible && !visible) {
          visible = true;
          lastTick = 0;
          frameId = requestAnimationFrame(tick);
        } else if (!nextVisible && visible) {
          visible = false;
          cancelAnimationFrame(frameId);
        }
      },
      { rootMargin: "48px", threshold: 0.05 },
    );
    visibilityObserver.observe(stage);

    return () => {
      visible = false;
      cancelAnimationFrame(frameId);
      visibilityObserver.disconnect();
      globe.destroy();
    };
  }, []);

  const topRanked = [...rankings]
    .filter((r): r is CountryRanking & { rank: number } => r.rank !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 6);

  return (
    <div className="trackapp-country-globe">
      <div ref={stageRef} className="trackapp-country-globe__stage">
        <canvas
          ref={canvasRef}
          className="trackapp-country-globe__canvas"
          aria-hidden
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - pointerInteractingMovement.current;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
          }}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) {
              pointerInteractingMovement.current = e.clientX - pointerInteracting.current;
            }
          }}
        />
      </div>
      {topRanked.length > 0 ? (
        <div className="trackapp-country-globe__chips">
          {topRanked.map((r) => (
            <button
              key={r.country}
              type="button"
              className={`trackapp-country-globe__chip ${focusCountry === r.country ? "trackapp-country-globe__chip--active" : ""}`}
              onClick={() => onFocusCountry(focusCountry === r.country ? null : r.country)}
            >
              <span aria-hidden>{r.flag}</span>
              <span>{r.name}</span>
              <span className="trackapp-country-globe__chip-rank">#{r.rank}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
