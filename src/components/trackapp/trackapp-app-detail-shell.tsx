"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import "@/styles/trackapp-app-detail.css";

const SECTIONS = [
  { id: "ta-section-overview", label: "Vue d'ensemble" },
  { id: "ta-section-monetization", label: "Monétisation" },
  { id: "ta-section-rankings", label: "Classements" },
  { id: "ta-section-presence", label: "Présence" },
  { id: "ta-section-intel", label: "Concurrents" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function TrackappAppDetailShell({ children }: Readonly<{ children: ReactNode }>) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<SectionId>("ta-section-overview");
  const [stuck, setStuck] = useState(false);

  const scrollTo = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    const topbar = 72;
    const navH = navRef.current?.offsetHeight ?? 48;
    const y = el.getBoundingClientRect().top + window.scrollY - topbar - navH - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActive(id);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id as SectionId);
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.15, 0.4] },
    );

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    const onScroll = () => {
      const rect = nav.getBoundingClientRect();
      setStuck(rect.top <= 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="ta-detail dashboard-main">
      <nav
        ref={navRef}
        className={cn("ta-detail-nav", stuck && "ta-detail-nav--stuck")}
        aria-label="Sections de la fiche app"
      >
        <ul className="ta-detail-nav__list" role="tablist">
          {SECTIONS.map(({ id, label }) => (
            <li key={id} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={active === id}
                className={cn("ta-detail-nav__btn", active === id && "ta-detail-nav__btn--active")}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ta-detail-sections">{children}</div>
    </div>
  );
}

export function TrackappAppDetailSection({
  id,
  children,
  className,
}: Readonly<{
  id: SectionId;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section id={id} className={cn("ta-detail-section", className)}>
      {children}
    </section>
  );
}
