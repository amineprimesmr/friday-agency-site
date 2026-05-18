"use client";

/**
 * Section « 3 étapes » — alignée sur fidelity/frontend/src/landing-cinematic/
 * FinTapStepsScrollSection + Desktop + Mobile (+ StepVisual).
 * Données : fintap-steps-data.js
 */
import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject, useSyncExternalStore } from "react";

import "@/styles/myfid-three-steps.css";

import { ScrollReveal } from "@/components/tracker/scroll-reveal";

/** fidelity/frontend/src/landing-cinematic/fintap-steps-data.js */
const FINTAP_STEPS = [
  {
    cardTitle: "Connectez votre commerce",
    cardDesc:
      "Recherchez votre établissement, validez l’adresse : Myfidpass prépare votre espace et votre carte Wallet.",
  },
  {
    cardTitle: "Personnalisez votre carte",
    cardDesc:
      "Couleurs, récompenses, tampons ou points : adaptez la carte à votre image et à votre offre.",
  },
  {
    cardTitle: "Fidélisez chaque client",
    cardDesc:
      "Partagez le QR, les clients ajoutent la carte au Wallet : chaque passage compte, sans friction.",
  },
] as const;

const ETAPE_ASSETS = ["/assets/etape1.png", "/assets/etape2.png", "/assets/etape3.png"] as const;

const ETAPE_ALTS = [
  "Étape 1 : connectez votre commerce",
  "Étape 2 : personnalisez votre carte",
  "Étape 3 : fidélisez chaque client",
] as const;

function StepVisualByIndex({ index }: { index: number }) {
  const i = Math.min(2, Math.max(0, index));
  return (
    <figure className="fintap-steps-mock fintap-steps-mock--etape">
      <div className="fintap-steps-mock-etape__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="fintap-steps-mock-etape__img"
          src={ETAPE_ASSETS[i]}
          alt={ETAPE_ALTS[i]}
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  );
}

const DESKTOP_MQ = "(min-width: 901px)";

function subscribeDesktopMql(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function snapshotDesktopMatches() {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_MQ).matches;
}

function snapshotDesktopServer() {
  return false;
}

function FinTapStepsScrollDesktop({ measureRef }: { measureRef: MutableRefObject<HTMLElement | null> }) {
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pinTopRef = useRef(104);
  const [rightH, setRightH] = useState(0);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const prev = panel.style.cssText;
    panel.style.position = "sticky";
    panel.style.top = "var(--fintap-steps-nav-clear)";
    const v = Number.parseFloat(getComputedStyle(panel).top);
    if (!Number.isNaN(v) && v > 0) pinTopRef.current = v;
    panel.style.cssText = prev;
  }, []);

  useEffect(() => {
    const right = rightRef.current;
    if (!right || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setRightH(Math.round(right.offsetHeight));
    });
    ro.observe(right);
    setRightH(Math.round(right.offsetHeight));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const section = measureRef?.current;
    if (!section) return;

    const cardEls = (): HTMLElement[] =>
      Array.from(
        section.querySelectorAll(".fintap-steps-scroll__desktop-row .fintap-steps-scroll__right article"),
      );

    let ticking = false;
    const applyPin = () => {
      ticking = false;
      const panel = panelRef.current;
      const leftCol = leftColRef.current;
      if (!panel || !leftCol) return;

      const pt = pinTopRef.current;
      const ph = panel.offsetHeight;
      const lc = leftCol.getBoundingClientRect();
      let mode = "flow";
      if (lc.top <= pt && lc.bottom >= pt + ph + 8) mode = "pinned";
      else if (lc.top <= pt) mode = "docked";

      if (mode === "flow") {
        panel.classList.remove("is-left-pinned", "is-left-docked");
        panel.style.position = "";
        panel.style.top = "";
        panel.style.left = "";
        panel.style.width = "";
        panel.style.right = "";
        panel.style.bottom = "";
      } else if (mode === "pinned") {
        panel.classList.add("is-left-pinned");
        panel.classList.remove("is-left-docked");
        panel.style.position = "fixed";
        panel.style.top = `${String(pt)}px`;
        panel.style.left = `${String(lc.left)}px`;
        panel.style.width = `${String(lc.width)}px`;
        panel.style.right = "";
        panel.style.bottom = "";
      } else {
        panel.classList.remove("is-left-pinned");
        panel.classList.add("is-left-docked");
        panel.style.position = "absolute";
        panel.style.top = "auto";
        panel.style.bottom = "0";
        panel.style.left = "0";
        panel.style.right = "0";
        panel.style.width = "";
      }
    };

    const tickActive = () => {
      const list = cardEls();
      if (list.length === 0) return;
      const ih = window.visualViewport?.height ?? window.innerHeight ?? 800;
      const pt = pinTopRef.current;
      const focalY = pt + (ih - pt) * 0.42;
      let bestIdx = 0;
      let bestDist = Infinity;
      list.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const mid = (r.top + r.bottom) / 2;
        const d = Math.abs(mid - focalY);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      setActive((prev) => (prev === bestIdx ? prev : bestIdx));
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          applyPin();
          tickActive();
        });
      }
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule, { passive: true });

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(section);
    const lc = leftColRef.current;
    if (lc) ro?.observe(lc);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      ro?.disconnect();
      const panel = panelRef.current;
      if (panel) {
        panel.classList.remove("is-left-pinned", "is-left-docked");
        panel.style.cssText = "";
      }
    };
  }, [measureRef, rightH]);

  return (
    <div className="fintap-steps-scroll__track">
      <div className="fintap-steps-scroll__desktop-row">
        <div
          ref={leftColRef}
          className="fintap-steps-scroll__left-col"
          style={rightH > 0 ? { minHeight: rightH } : undefined}
        >
          <div ref={panelRef} className="fintap-steps-scroll__left-sticky">
            <div className="fintap-steps-scroll__left">
              <ScrollReveal variant="slide-left">
                <h2 id="fintap-steps-heading" className="fintap-steps-scroll__h2">
                  Lancez-vous en 3 étapes simples.
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="slide-left" delay={0.1}>
                <p className="fintap-steps-scroll__intro">
                  Du commerce à la carte Wallet : tout est pensé pour vous faire gagner du temps et garder vos clients
                  engagés.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>

        <div className="fintap-steps-scroll__rail" aria-hidden="true">
          <span className="fintap-steps-scroll__rail-line" />
          <span className="fintap-steps-scroll__badge">{active + 1}</span>
        </div>

        <div ref={rightRef} className="fintap-steps-scroll__right">
          <div className="fintap-steps-scroll__cards" role="list" aria-live="polite">
            {FINTAP_STEPS.map((step, idx) => (
              <ScrollReveal
                key={step.cardTitle}
                tag="article"
                className={`fintap-steps-card fintap-steps-card--etape-media${active === idx ? " is-active" : ""}`}
                variant="fade-up"
                delay={0.06 * idx}
              >
                <div
                  className="fintap-steps-card__grey-panel"
                  role="listitem"
                  aria-current={active === idx ? "step" : undefined}
                >
                  <div className="fintap-steps-card__grey-panel-media">
                    <StepVisualByIndex index={idx} />
                  </div>
                  <h3 className="fintap-steps-card__title">{step.cardTitle}</h3>
                  <p className="fintap-steps-card__desc">{step.cardDesc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinTapStepsScrollMobile() {
  return (
    <div className="fintap-steps-scroll__mobile">
      <ScrollReveal>
        <h2 id="fintap-steps-heading" className="fintap-steps-scroll__h2">
          Lancez-vous en 3 étapes simples.
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="fintap-steps-scroll__intro">
          Du commerce à la carte Wallet : tout est pensé pour vous faire gagner du temps et garder vos clients engagés.
        </p>
      </ScrollReveal>
      <ol className="fintap-steps-mobile__list">
        {FINTAP_STEPS.map((step, idx) => (
          <ScrollReveal key={step.cardTitle} tag="li" className="fintap-steps-mobile__step" variant="scale-up" delay={0.1 * idx}>
            <div className="fintap-steps-card__grey-panel fintap-steps-mobile__grey-panel">
              <span className="fintap-steps-card__footer-num fintap-steps-mobile__badge" aria-hidden="true">
                {idx + 1}
              </span>
              <div className="fintap-steps-card__grey-panel-media">
                <StepVisualByIndex index={idx} />
              </div>
              <h4 className="fintap-steps-card__title fintap-steps-mobile__card-title">{step.cardTitle}</h4>
              <p className="fintap-steps-card__desc">{step.cardDesc}</p>
            </div>
          </ScrollReveal>
        ))}
      </ol>
    </div>
  );
}

export function MyfidThreeStepsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const isDesktop = useSyncExternalStore(subscribeDesktopMql, snapshotDesktopMatches, snapshotDesktopServer);

  return (
    <section
      ref={sectionRef}
      className="tracker-fintap-steps fintap-steps-scroll"
      id="comment-ca-marche"
      aria-labelledby="fintap-steps-heading"
      lang="fr"
    >
      {isDesktop ? <FinTapStepsScrollDesktop measureRef={sectionRef} /> : <FinTapStepsScrollMobile />}
    </section>
  );
}
