"use client";

import { Inter } from "next/font/google";
import Image from "next/image";
import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type MutableRefObject } from "react";

import "@/styles/myfid-three-steps.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

/** Données & visuels alignés sur myfidpass (landing chunk). */
const STEPS = [
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

const STEP_IMAGES = ["/assets/etape1.png", "/assets/etape2.png", "/assets/etape3.png"] as const;

const STEP_ALTS = [
  "Étape 1 : connectez votre commerce",
  "Étape 2 : personnalisez votre carte",
  "Étape 3 : fidélisez chaque client",
] as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MOTION_VARIANTS: Record<string, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
    show: { opacity: 1, scale: 1, filter: "blur(0px)" },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -48, filter: "blur(4px)" },
    show: { opacity: 1, x: 0, filter: "blur(0px)" },
  },
};

const VIEWPORT_AMOUNT = { amount: 0.15, margin: "0px 0px -8% 0px" } as const;

const MEDIA_DESKTOP = "(min-width: 901px)";

/** Équivalent `C()` du landing — révélations entrée vue. */
function RevealMotion({
  children,
  className,
  variant = "fade-up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof MOTION_VARIANTS;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT_AMOUNT);
  const show = !!reduceMotion || inView;

  const variants = MOTION_VARIANTS[variant] ?? MOTION_VARIANTS["fade-up"];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      transition={{ duration: 0.7, ease: EASE, delay: show ? delay : 0 }}
    >
      {children}
    </motion.div>
  );
}

function RevealMotionArticle({
  children,
  className,
  variant = "fade-up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof MOTION_VARIANTS;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT_AMOUNT);
  const show = !!reduceMotion || inView;

  const variants = MOTION_VARIANTS[variant] ?? MOTION_VARIANTS["fade-up"];

  if (reduceMotion) {
    return <article className={className}>{children}</article>;
  }

  return (
    <motion.article
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      transition={{ duration: 0.7, ease: EASE, delay: show ? delay : 0 }}
    >
      {children}
    </motion.article>
  );
}

function RevealMotionLi({
  children,
  className,
  variant = "scale-up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof MOTION_VARIANTS;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT_AMOUNT);
  const show = !!reduceMotion || inView;

  const variants = MOTION_VARIANTS[variant] ?? MOTION_VARIANTS["scale-up"];

  if (reduceMotion) {
    return <li className={className}>{children}</li>;
  }

  return (
    <motion.li
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      transition={{ duration: 0.7, ease: EASE, delay: show ? delay : 0 }}
    >
      {children}
    </motion.li>
  );
}

function StepMockFigure({ index }: { index: number }) {
  const i = Math.min(2, Math.max(0, index));
  return (
    <figure className="fintap-steps-mock fintap-steps-mock--etape">
      <div className="fintap-steps-mock-etape__frame">
        <Image
          className="fintap-steps-mock-etape__img"
          src={STEP_IMAGES[i]}
          alt={STEP_ALTS[i]}
          width={1024}
          height={1024}
          sizes="(max-width:900px) 100vw, 460px"
        />
      </div>
    </figure>
  );
}

/** Colonne titre + ligne pointillée + cartes avec étape « active » au scroll — copie comportement prod. */
function StepsDesktopScroll({ measureRef }: { measureRef: MutableRefObject<HTMLElement | null> }) {
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightInnerRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);
  const stickyTopPx = useRef(104);
  const [rightInnerHeight, setRightInnerHeight] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  useLayoutEffect(() => {
    const el = stickyInnerRef.current;
    if (!el) return;
    const prevCss = el.style.cssText;
    el.style.position = "sticky";
    el.style.top = "var(--fintap-steps-nav-clear)";
    const raw = parseFloat(getComputedStyle(el).top);
    if (!Number.isNaN(raw) && raw > 0) stickyTopPx.current = raw;
    el.style.cssText = prevCss;
  }, []);

  useEffect(() => {
    const col = rightInnerRef.current;
    if (!col || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setRightInnerHeight(Math.round(col.offsetHeight)));
    ro.observe(col);
    setRightInnerHeight(Math.round(col.offsetHeight));
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const section = measureRef.current;
    if (!section) return;
    const stickyCleanupTarget = stickyInnerRef.current;

    const getArticles = () =>
      Array.from(
        section.querySelectorAll(".fintap-steps-scroll__desktop-row .fintap-steps-scroll__right article"),
      ) as HTMLElement[];

    let ticking = false;

    const measureStickyMode = () => {
      ticking = false;
      const sticky = stickyInnerRef.current;
      const col = leftColRef.current;
      if (!sticky || !col) return;
      const clearance = stickyTopPx.current;
      const hSticky = sticky.offsetHeight;
      const colRect = col.getBoundingClientRect();
      let mode: "flow" | "pinned" | "docked";
      if (colRect.top <= clearance && colRect.bottom >= hSticky + clearance + 8) {
        mode = "pinned";
      } else if (colRect.top <= clearance) {
        mode = "docked";
      } else {
        mode = "flow";
      }
      if (mode === "flow") {
        sticky.classList.remove("is-left-pinned", "is-left-docked");
        sticky.style.position = "";
        sticky.style.top = "";
        sticky.style.left = "";
        sticky.style.width = "";
        sticky.style.right = "";
        sticky.style.bottom = "";
      } else if (mode === "pinned") {
        sticky.classList.add("is-left-pinned");
        sticky.classList.remove("is-left-docked");
        sticky.style.position = "fixed";
        sticky.style.top = `${clearance}px`;
        sticky.style.left = `${colRect.left}px`;
        sticky.style.width = `${colRect.width}px`;
        sticky.style.right = "";
        sticky.style.bottom = "";
      } else {
        sticky.classList.remove("is-left-pinned");
        sticky.classList.add("is-left-docked");
        sticky.style.position = "absolute";
        sticky.style.top = "auto";
        sticky.style.bottom = "0";
        sticky.style.left = "0";
        sticky.style.right = "0";
        sticky.style.width = "";
      }
    };

    const pickActiveCard = () => {
      const articles = getArticles();
      if (articles.length === 0) return;
      const vvH = window.visualViewport?.height ?? window.innerHeight ?? 800;
      const clearance = stickyTopPx.current;
      const midpointY = clearance + (vvH - clearance) * 0.42;
      let best = 0;
      let bestDist = Infinity;
      articles.forEach((art, gi) => {
        const r = art.getBoundingClientRect();
        const cy = (r.top + r.bottom) / 2;
        const d = Math.abs(cy - midpointY);
        if (d < bestDist) {
          bestDist = d;
          best = gi;
        }
      });
      setActiveIdx((v) => (v === best ? v : best));
    };

    const onScrollResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        measureStickyMode();
        pickActiveCard();
      });
    };

    onScrollResize();

    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize, { passive: true });
    window.visualViewport?.addEventListener("resize", onScrollResize, { passive: true });

    const roSection = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScrollResize) : null;
    roSection?.observe(section);
    const lc = leftColRef.current;
    if (lc) roSection?.observe(lc);

    return () => {
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
      window.visualViewport?.removeEventListener("resize", onScrollResize);
      roSection?.disconnect();
      if (stickyCleanupTarget) {
        stickyCleanupTarget.classList.remove("is-left-pinned", "is-left-docked");
        stickyCleanupTarget.style.cssText = "";
      }
    };
  }, [measureRef, rightInnerHeight]);

  return (
    <div className="fintap-steps-scroll__track">
      <div className="fintap-steps-scroll__desktop-row">
        <div
          ref={leftColRef}
          className="fintap-steps-scroll__left-col"
          style={rightInnerHeight > 0 ? { minHeight: rightInnerHeight } : undefined}
        >
          <div ref={stickyInnerRef} className="fintap-steps-scroll__left-sticky">
            <div className="fintap-steps-scroll__left">
              <RevealMotion variant="slide-left">
                <h2 id="fintap-steps-heading" className={`fintap-steps-scroll__h2 ${inter.className}`}>
                  Lancez-vous en 3 étapes simples.
                </h2>
              </RevealMotion>
              <RevealMotion variant="slide-left" delay={0.1}>
                <p className={`fintap-steps-scroll__intro ${inter.className}`}>
                  Du commerce à la carte Wallet : tout est pensé pour vous faire gagner du temps et garder vos clients
                  engagés.
                </p>
              </RevealMotion>
            </div>
          </div>
        </div>

        <div className="fintap-steps-scroll__rail" aria-hidden="true">
          <span className="fintap-steps-scroll__rail-line" />
          <span className="fintap-steps-scroll__badge">{activeIdx + 1}</span>
        </div>

        <div ref={rightInnerRef} className="fintap-steps-scroll__right">
          <div className="fintap-steps-scroll__cards" role="list" aria-live="polite">
            {STEPS.map((step, fi) => (
              <RevealMotionArticle
                key={step.cardTitle}
                variant="fade-up"
                delay={0.06 * fi}
                className={`fintap-steps-card fintap-steps-card--etape-media${activeIdx === fi ? " is-active" : ""}`}
              >
                <div
                  className="fintap-steps-card__grey-panel"
                  role="listitem"
                  aria-current={activeIdx === fi ? "step" : undefined}
                >
                  <div className="fintap-steps-card__grey-panel-media">
                    <StepMockFigure index={fi} />
                  </div>
                  <h3 className={`fintap-steps-card__title ${inter.className}`}>{step.cardTitle}</h3>
                  <p className={`fintap-steps-card__desc ${inter.className}`}>{step.cardDesc}</p>
                </div>
              </RevealMotionArticle>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepsMobileStatic() {
  return (
    <div className="fintap-steps-scroll__mobile">
      <RevealMotion>
        <h2 id="fintap-steps-heading" className={`fintap-steps-scroll__h2 ${inter.className}`}>
          Lancez-vous en 3 étapes simples.
        </h2>
      </RevealMotion>
      <RevealMotion variant="fade-up" delay={0.1}>
        <p className={`fintap-steps-scroll__intro ${inter.className}`}>
          Du commerce à la carte Wallet : tout est pensé pour vous faire gagner du temps et garder vos clients
          engagés.
        </p>
      </RevealMotion>

      <ol className={`fintap-steps-mobile__list ${inter.className}`}>
        {STEPS.map((step, n) => (
          <RevealMotionLi
            key={step.cardTitle}
            variant="scale-up"
            delay={0.1 * n}
            className="fintap-steps-mobile__step"
          >
            <div className="fintap-steps-card__grey-panel fintap-steps-mobile__grey-panel">
              <span className="fintap-steps-card__footer-num fintap-steps-mobile__badge" aria-hidden="true">
                {n + 1}
              </span>
              <div className="fintap-steps-card__grey-panel-media">
                <StepMockFigure index={n} />
              </div>
              <h4 className={`fintap-steps-card__title fintap-steps-mobile__card-title ${inter.className}`}>
                {step.cardTitle}
              </h4>
              <p className={`fintap-steps-card__desc ${inter.className}`}>{step.cardDesc}</p>
            </div>
          </RevealMotionLi>
        ))}
      </ol>
    </div>
  );
}

/**
 * Section identique au bloc myfidpass « Comment ça marche » (#comment-ca-marche) :
 * titre sticky + ligne + badge dynamique + cartes avec highlight au scroll sur desktop.
 */
export function MyfidThreeStepsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MEDIA_DESKTOP);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`tracker-fintap-steps fintap-steps-scroll ${inter.className}`}
      id="comment-ca-marche"
      aria-labelledby="fintap-steps-heading"
      lang="fr"
    >
      {isDesktop ? <StepsDesktopScroll measureRef={sectionRef} /> : <StepsMobileStatic />}
    </section>
  );
}
