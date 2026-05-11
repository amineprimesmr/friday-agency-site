"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "@/styles/fooontic-kwpragr-pen.css";
import "@/styles/tracker-switcher-dark-lock.css";

function trackPrevious(el: HTMLElement) {
  const radios = el.querySelectorAll('input[type="radio"]');
  let previousValue: string | null = null;

  const initiallyChecked = el.querySelector('input[type="radio"]:checked');
  if (initiallyChecked instanceof HTMLInputElement) {
    previousValue = initiallyChecked.getAttribute("c-option");
    el.setAttribute("c-previous", previousValue ?? "");
  }

  const handler = (e: Event) => {
    const radio = e.target;
    if (radio instanceof HTMLInputElement && radio.checked) {
      el.setAttribute("c-previous", previousValue ?? "");
      previousValue = radio.getAttribute("c-option");
    }
  };

  radios.forEach((radio) => radio.addEventListener("change", handler));
  return () => radios.forEach((radio) => radio.removeEventListener("change", handler));
}

/** Aligne géométriquement le ``::after`` sur la `label` de l’item coché (largeurs différentes, subpixels). */
function syncNavPillRect(fieldset: HTMLElement) {
  const checked = fieldset.querySelector<HTMLInputElement>('input[name="tracker-nav"]:checked');
  if (!checked) return;
  const label = checked.closest(".switcher__option");
  if (!(label instanceof HTMLElement)) return;

  const fr = fieldset.getBoundingClientRect();
  const lr = label.getBoundingClientRect();
  fieldset.style.setProperty("--nav-pill-left", `${lr.left - fr.left}px`);
  fieldset.style.setProperty("--nav-pill-top", `${lr.top - fr.top}px`);
  fieldset.style.setProperty("--nav-pill-width", `${lr.width}px`);
  fieldset.style.setProperty("--nav-pill-height", `${lr.height}px`);
}

function setupTrackerNavSwitcher(fieldset: HTMLElement) {
  const syncPill = () => requestAnimationFrame(() => syncNavPillRect(fieldset));

  const offPrev = trackPrevious(fieldset);

  /** Double frame : typo / flex stabilisées après hydrate + fetch HTML injecté */
  syncPill();
  requestAnimationFrame(syncPill);

  if (document.fonts?.ready) {
    void document.fonts.ready.then(syncPill);
  }

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(syncPill)
      : undefined;
  resizeObserver?.observe(fieldset);
  for (const label of fieldset.querySelectorAll(".switcher__option")) {
    resizeObserver?.observe(label as Element);
  }

  const onResize = () => syncPill();
  window.addEventListener("resize", onResize);

  const scrollToId = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    } catch {
      //
    }
  };

  const findInputForAnchor = (id: string): HTMLInputElement | null => {
    const inputs = fieldset.querySelectorAll<HTMLInputElement>(
      'input[name="tracker-nav"][data-scroll-target]',
    );
    for (const inp of inputs) {
      if (inp.dataset.scrollTarget === id) return inp;
    }
    return null;
  };

  const applyHash = () => {
    const slug = window.location.hash.replace(/^#/, "");
    if (!slug) return;
    let raw = slug;
    try {
      raw = decodeURIComponent(slug);
    } catch {
      /* hash invalide — brut */
    }
    const inp = findInputForAnchor(raw);
    if (inp) {
      inp.checked = true;
      syncPill();
    }
  };

  const onChange = (e: Event) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (!t.checked) return;
    const id = t.dataset.scrollTarget;
    if (!id) return;
    syncPill();
    scrollToId(id);
  };

  fieldset.addEventListener("change", onChange);
  applyHash();
  window.addEventListener("hashchange", applyHash);

  return () => {
    offPrev();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", onResize);
    fieldset.removeEventListener("change", onChange);
    window.removeEventListener("hashchange", applyHash);
  };
}

export function TrackerHeader() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/fooontic-pen-switcher.html?v=6", { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((body) => {
        if (!cancelled) setHtml(body);
      })
      .catch((err) => {
        console.error("TrackerHeader: fooontic-pen-switcher.html", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!html) return undefined;
    const root = hostRef.current;
    if (!root) return undefined;
    const el = root.querySelector(".tracker-nav-switcher");
    if (!(el instanceof HTMLElement)) return undefined;
    return setupTrackerNavSwitcher(el);
  }, [html]);

  return (
    <div className="tracker-switcher-host">
      <div
        ref={hostRef}
        suppressHydrationWarning
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
      />
        </div>
  );
}
