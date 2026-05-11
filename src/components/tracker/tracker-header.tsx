"use client";

import { useEffect, useRef, useState } from "react";

import "@/styles/fooontic-kwpragr-pen.css";
import "@/styles/tracker-switcher-dark-lock.css";

export function TrackerHeader() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/fooontic-pen-switcher.html?v=7", { cache: "no-cache" })
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
