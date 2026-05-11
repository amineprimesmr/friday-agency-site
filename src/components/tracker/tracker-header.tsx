"use client";

import { useEffect, useRef, useState } from "react";

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

export function TrackerHeader() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/fooontic-pen-switcher.html?v=3", { cache: "no-cache" })
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

  useEffect(() => {
    if (!html) return;
    const root = hostRef.current;
    if (!root) return;
    const el = root.querySelector(".switcher");
    if (!(el instanceof HTMLElement)) return;
    return trackPrevious(el);
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
