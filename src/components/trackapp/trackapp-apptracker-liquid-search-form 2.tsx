"use client";

import { FormEvent, useId, useRef } from "react";

import type { CountryCode } from "@/lib/apple-charts";

import "@/styles/trackapp-apptracker-liquid-search.css";
import "@/styles/tracker-search-bar.css";

type Props = Readonly<{
  defaultQuery: string;
  country: CountryCode;
}>;

export function TrackappApptrackerLiquidSearchForm({ defaultQuery, country }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFormMouseDown = (e: React.MouseEvent<HTMLFormElement>) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, button")) return;
    e.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const q = inputRef.current?.value.trim() ?? "";
    if (!q) e.preventDefault();
  };

  return (
    <div className="trackapp-apptracker-liquid-search">
      <div className="trackapp-apptracker-liquid-search__stage">
        <div
          className="tracker-switcher-host trackapp-accueil-search-host w-full min-w-0"
          data-search-surface="light"
        >
          <div className="tracker-search-desktop-host w-full">
            <div className="tracker-search-stack tracker-search-stack--desktop w-full">
              <form
                action="/trackapp/accueil"
                method="get"
                role="search"
                className="tracker-search-pill trackapp-apptracker-liquid-search__form"
                autoComplete="off"
                onSubmit={onSubmit}
                onMouseDown={onFormMouseDown}
              >
                <svg
                  className="tracker-search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                  ref={inputRef}
                  id={inputId}
                  name="q"
                  type="search"
                  defaultValue={defaultQuery}
                  inputMode="search"
                  enterKeyHint="search"
                  className="tracker-search-input"
                  placeholder="Rechercher une app…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="Rechercher une app"
                />

                <input type="hidden" name="country" value={country} />

                <button type="submit" className="trackapp-apptracker-liquid-search__submit" aria-label="Lancer la recherche">
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
