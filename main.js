/**
 * Interface plein écran sans scroll : navigation par panneaux (dock / points / boutons).
 */

const PANEL_COUNT = 2;
/** Panneau 0 = Réalisations (accueil du site), panneau 1 = Contact. #accueil redirige vers les réalisations. */
const HASH_PANEL = { accueil: 0, realisations: 0, contact: 1 };

/** Crossfade à deux calques : quel layer affiche la photo (null = aucune couche visible). */
let showcaseBackdropGen = 0;
/** @type {null | 0 | 1} */
let showcaseVisibleLayerIdx = null;

/** Recalcul du translate du track après mise à jour du bleed plein écran (assigné dans initProjectsCarousel). */
let cinemaBleedThenRecalcTransform = null;

/** Captures « plein écran » : services publics (mshots + fallback), puis wash CSS si échec. */
function screenshotThumbUrls(siteUrl) {
  const enc = encodeURIComponent(siteUrl);
  return [
    `https://s.wordpress.com/mshots/v1/${enc}?w=1600`,
    `https://image.thum.io/get/width/1400/crop/900/noanimate/${siteUrl}`,
  ];
}

/** Chemins locaux (`data-showcase-image`, séparés par virgule = fallback) en priorité, sinon APIs tierces. */
function showcaseBackdropCandidates(slide) {
  const raw = slide.getAttribute("data-showcase-image")?.trim();
  if (raw) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const siteUrl = slide.getAttribute("data-showcase-url")?.trim() ?? "";
  return siteUrl ? screenshotThumbUrls(siteUrl) : [];
}

/** Attributs responsive optionnels sur la slide : `data-showcase-srcset` + `data-showcase-sizes` (ex. 3840w pour écrans larges). */
function applyShowcaseResponsiveAttrs(slide, img) {
  const srcset = slide.getAttribute("data-showcase-srcset")?.trim() ?? "";
  const sizes = slide.getAttribute("data-showcase-sizes")?.trim() ?? "";
  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes || "100vw";
  } else {
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
  }
}

function setShowcaseBackdropVisible(visible) {
  const el = document.getElementById("friday-showcase-bg");
  if (!el) return;
  el.classList.toggle("is-visible", Boolean(visible));
  if (!visible) {
    showcaseBackdropGen++;
    showcaseVisibleLayerIdx = null;
    delete el.dataset.activeShowcase;
    el.classList.remove("has-photo");
    el.querySelectorAll(".bg-showcase__layer").forEach((layer) => {
      layer.classList.remove("is-visible");
      layer.setAttribute("aria-hidden", "true");
    });
    el.querySelectorAll(".bg-showcase__photo").forEach((img) => {
      img.onload = null;
      img.onerror = null;
      img.removeAttribute("src");
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    });
  }
}

function getShowcasePhotoLayers(root) {
  const stack = root?.querySelector(".bg-showcase__photo-stack");
  if (!stack) return [];
  return [...stack.querySelectorAll(".bg-showcase__layer")];
}

/** Précharge toutes les URLs des slides pour que le crossfade soit quasi instantané après la 1ʳᵉ lecture. */
function preloadShowcaseBackdropUrls(slides) {
  const run = () => {
    const seen = new Set();
    for (const slide of slides) {
      for (const u of showcaseBackdropCandidates(slide)) {
        if (seen.has(u)) continue;
        seen.add(u);
        const im = new Image();
        im.decoding = "async";
        im.src = u;
        im.decode?.()?.catch(() => {});
      }
    }
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => run(), { timeout: 1800 });
  } else {
    setTimeout(run, 80);
  }
}

function applyShowcaseBackdrop(slide) {
  const root = document.getElementById("friday-showcase-bg");
  const wash = document.getElementById("friday-showcase-wash");
  const layers = getShowcasePhotoLayers(root);
  if (!root || !wash || layers.length < 2 || !slide) return;

  const gen = ++showcaseBackdropGen;

  const key = slide.getAttribute("data-showcase-key") ?? "";
  wash.className = `bg-showcase__wash${key ? ` bg-showcase__wash--${key}` : ""}`;

  const urls = showcaseBackdropCandidates(slide);

  const hideAllPhotos = () => {
    delete root.dataset.activeShowcase;
    root.classList.remove("has-photo");
    showcaseVisibleLayerIdx = null;
    layers.forEach((layer) => {
      layer.classList.remove("is-visible");
      layer.setAttribute("aria-hidden", "true");
      const im = layer.querySelector(".bg-showcase__photo");
      if (!im) return;
      im.onload = null;
      im.onerror = null;
      im.removeAttribute("src");
      im.removeAttribute("srcset");
      im.removeAttribute("sizes");
    });
  };

  if (!urls.length) {
    hideAllPhotos();
    return;
  }

  const outgoingIdx = showcaseVisibleLayerIdx;
  const incomingIdx = outgoingIdx == null ? 0 : 1 - outgoingIdx;
  const incomingLayer = layers[incomingIdx];
  const incomingImg = incomingLayer?.querySelector(".bg-showcase__photo");
  if (!incomingLayer || !incomingImg) return;

  root.dataset.activeShowcase = key;
  root.classList.add("has-photo");

  applyShowcaseResponsiveAttrs(slide, incomingImg);
  incomingImg.fetchPriority = document.body.dataset.fridayPanel === "0" ? "high" : "low";

  const swapIn = () => {
    if (gen !== showcaseBackdropGen) return;
    incomingLayer.classList.add("is-visible");
    incomingLayer.setAttribute("aria-hidden", "false");
    if (outgoingIdx != null && outgoingIdx !== incomingIdx) {
      const out = layers[outgoingIdx];
      out?.classList.remove("is-visible");
      out?.setAttribute("aria-hidden", "true");
    }
    showcaseVisibleLayerIdx = incomingIdx;
  };

  const tryDecodeThenSwap = () => {
    if (gen !== showcaseBackdropGen) return;
    const d = incomingImg.decode?.();
    if (d && typeof d.then === "function") {
      d.then(() => requestAnimationFrame(swapIn)).catch(() => requestAnimationFrame(swapIn));
    } else {
      requestAnimationFrame(swapIn);
    }
  };

  let attempt = 0;

  const bindLoading = () => {
    incomingImg.onload = () => {
      if (gen !== showcaseBackdropGen) return;
      incomingImg.onload = null;
      incomingImg.onerror = null;
      tryDecodeThenSwap();
    };
    incomingImg.onerror = () => {
      if (gen !== showcaseBackdropGen) return;
      incomingImg.onload = null;
      incomingImg.onerror = null;
      attempt += 1;
      if (attempt < urls.length) {
        bindLoading();
        incomingImg.src = urls[attempt];
        if (incomingImg.complete && incomingImg.naturalWidth > 0) {
          incomingImg.onload = null;
          incomingImg.onerror = null;
          tryDecodeThenSwap();
        }
      } else {
        hideAllPhotos();
      }
    };
  };

  bindLoading();

  incomingImg.src = urls[attempt];
  if (incomingImg.complete && incomingImg.naturalWidth) {
    incomingImg.onload = null;
    incomingImg.onerror = null;
    tryDecodeThenSwap();
  }
}

function syncShowcaseBackdropForWorkPanel() {
  if (document.body.dataset.fridayPanel !== "0") {
    setShowcaseBackdropVisible(false);
    return;
  }
  const carouselRoot = document.querySelector("[data-projects-carousel]");
  const allSlides = carouselRoot ? [...carouselRoot.querySelectorAll("[data-carousel-slide]")] : [];
  const visible = allSlides.filter((s) => !s.classList.contains("cinema-slide--filtered-out"));
  const ci = Math.max(0, Math.min(visible.length - 1, Number(carouselRoot?.dataset.carouselIndex ?? 0)));
  setShowcaseBackdropVisible(true);
  applyShowcaseBackdrop(visible[ci]);
}

/**
 * Colle la zone carrousel au bord droit du viewport : écart réel (px) entre la colonne `.panel-inner--work`
 * et le bord droit, car le CSS pur (100% dans custom properties) est peu fiable selon les moteurs.
 */
function updateWorkCarouselViewportBleed() {
  const carousel = document.querySelector("[data-projects-carousel]");
  const inner = document.querySelector(".panel-inner--work");
  if (!carousel || !inner) return;

  if (document.body.dataset.fridayPanel !== "0") {
    carousel.style.removeProperty("--cinema-bleed-px");
    carousel.querySelector(".cinema-carousel__viewport")?.style.removeProperty("--cinema-clip-left");
    return;
  }

  const vw = document.documentElement.clientWidth || window.innerWidth || 0;
  const mobile = window.matchMedia("(max-width: 767.98px)").matches;
  /** Sur téléphone la colonne ≈ viewport : le bleed desktop désaligne cartes et points. */
  const bleedPx = mobile ? 0 : Math.max(0, vw - inner.getBoundingClientRect().right);
  carousel.style.setProperty("--cinema-bleed-px", `${bleedPx}px`);
  cinemaBleedThenRecalcTransform?.();
}

function wireSwitcherTrackPrevious(fieldset) {
  if (!fieldset) return;
  const radios = fieldset.querySelectorAll('input[type="radio"]');

  let previousValue = null;
  const initial = fieldset.querySelector('input[type="radio"]:checked');
  if (initial) {
    previousValue = initial.getAttribute("data-option");
    fieldset.setAttribute("data-previous", previousValue);
  }

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      fieldset.setAttribute("data-previous", previousValue ?? "");
      previousValue = radio.getAttribute("data-option");
    });
  });
}

/** Dock : .dock-item — Réalisations (0), Contact (1), CTA Commencer (2). */
function dockPhysicalIndexForPanel(panelIdx) {
  if (panelIdx === 0) return 0;
  return 2;
}

function syncDockUi(panelIdx, dots, dockItems) {
  const phys = dockPhysicalIndexForPanel(panelIdx);
  dockItems.forEach((b, j) => {
    const on = j === phys;
    b.classList.toggle("is-active", on);
    if (on) b.setAttribute("aria-current", "true");
    else b.removeAttribute("aria-current");
  });

  dots.forEach((d, j) => {
    const on = j === panelIdx;
    d.classList.toggle("is-active", on);
    d.setAttribute("aria-selected", on ? "true" : "false");
    if (on) d.setAttribute("aria-current", "true");
    else d.removeAttribute("aria-current");
  });
}

function goPanel(rawIdx) {
  let idx = Number(rawIdx);
  if (!Number.isFinite(idx)) return;
  idx = Math.max(0, Math.min(PANEL_COUNT - 1, idx));

  const panels = [...document.querySelectorAll(".friday-panel")];
  const dots = document.querySelectorAll(".carousel-dots .dot");
  const dock = document.querySelector(".bottom-dock");
  const dockItems = dock ? [...dock.querySelectorAll(".dock-item")] : [];
  const header = document.querySelector(".top-glass-bar");

  panels.forEach((panel, i) => {
    const active = i === idx;
    panel.classList.toggle("is-active", active);
    panel.toggleAttribute("hidden", !active);
    panel.setAttribute("aria-hidden", active ? "false" : "true");
  });

  document.body.dataset.fridayPanel = String(idx);
  syncDockUi(idx, dots, dockItems);
  header?.classList.toggle("is-scrolled", idx !== 0);

  if (idx === 0) {
    syncShowcaseBackdropForWorkPanel();
    requestAnimationFrame(() => updateWorkCarouselViewportBleed());
  } else {
    setShowcaseBackdropVisible(false);
    const car = document.querySelector("[data-projects-carousel]");
    car?.style.removeProperty("--cinema-bleed-px");
    car?.querySelector(".cinema-carousel__viewport")?.style.removeProperty("--cinema-clip-left");
  }

  const activePanel = panels[idx];
  activePanel?.focus({ preventScroll: true });
}

function initFridayNavigation() {
  document.body.addEventListener(
    "click",
    (e) => {
      const t = e.target instanceof Element ? e.target.closest("[data-friday-go]") : null;
      if (!t) return;
      const raw = t.getAttribute("data-friday-go");
      if (raw == null) return;
      e.preventDefault();
      goPanel(raw);

      const sw = t.getAttribute("data-sync-switch");
      if (sw) {
        const input = document.querySelector(`#friday-liquid-glass input[data-option="${sw}"]`);
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    },
    true
  );

  window.addEventListener(
    "hashchange",
    () => {
      const key = window.location.hash.replace(/^#/, "");
      if (key in HASH_PANEL) goPanel(HASH_PANEL[key]);
    },
    { passive: true }
  );

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")?.replace(/^#/, "");
      if (id && id in HASH_PANEL) {
        e.preventDefault();
        goPanel(HASH_PANEL[id]);
      }
    });
  });
}

function initProjectsCarousel() {
  const root = document.querySelector("[data-projects-carousel]");
  const viewport = root?.querySelector(".cinema-carousel__viewport");
  const track = root?.querySelector(".cinema-carousel__track");
  const allSlides = track ? [...track.querySelectorAll("[data-carousel-slide]")] : [];
  const dotsRoot = document.querySelector("[data-carousel-dots]");
  const dots = dotsRoot ? [...dotsRoot.querySelectorAll("[data-carousel-index]")] : [];
  if (!root || !viewport || !track || allSlides.length === 0) return;

  /** Slides visibles selon le filtre Tout / iOS / Web (sous-ensemble de allSlides). */
  let slides = [...allSlides];

  /** Colonne contenu (pastilles, typo) — pas le viewport élargi à droite par `--cinema-bleed-px`. */
  const workColumn = root.closest(".panel-inner--work");

  let index = 0;
  let touchStartX = null;

  /** Empêche deux changements de slide pendant l’animation CSS (évite « 2 par 2 »). */
  let slideAnimLocked = false;
  let slideUnlockFallbackTimer = null;

  /** Molette : accumulation + 1 lecture par frame = au plus un `go()` par pic de scroll */
  let accumWheel = 0;
  let wheelFlushQueued = false;

  const WHEEL_ACCUM_THRESHOLD = 68;

  function normalizeWheelDelta(e) {
    let dx = e.deltaX;
    let dy = e.deltaY;
    if (e.deltaMode === 1) {
      dx *= 16;
      dy *= 16;
    } else if (e.deltaMode === 2) {
      const vw = viewport.clientWidth || 800;
      const vh = viewport.clientHeight || 400;
      dx *= vw;
      dy *= vh;
    }
    return { dx, dy };
  }

  function cancelCarouselFallbackUnlock() {
    if (slideUnlockFallbackTimer != null) {
      window.clearTimeout(slideUnlockFallbackTimer);
      slideUnlockFallbackTimer = null;
    }
  }

  function releaseCarouselSlideLock() {
    slideAnimLocked = false;
    cancelCarouselFallbackUnlock();
  }

  function armCarouselUnlockFallback() {
    cancelCarouselFallbackUnlock();
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 70 : 800;
    slideUnlockFallbackTimer = window.setTimeout(() => {
      slideAnimLocked = false;
      slideUnlockFallbackTimer = null;
    }, ms);
  }

  track.addEventListener(
    "transitionend",
    (e) => {
      if (e.target !== track || e.propertyName !== "transform") return;
      slideAnimLocked = false;
      cancelCarouselFallbackUnlock();
    },
    { passive: true }
  );

  function syncDots() {
    dots.forEach((d) => {
      const gIdx = Number(d.getAttribute("data-carousel-index"));
      const slideEl = allSlides[gIdx];
      const hidden = !slideEl || slideEl.classList.contains("cinema-slide--filtered-out");
      d.hidden = hidden;
      const on = !hidden && slides[index] === slideEl;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
      if (on) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  /** Passage dernier → premier ou premier → dernier : saut sans animation (sinon le track traverse toutes les slides). */
  function isCarouselLoopWrap(prev, next) {
    const n = slides.length;
    if (n < 2) return false;
    return (prev === n - 1 && next === 0) || (prev === 0 && next === n - 1);
  }

  function commitCarouselIndex(next) {
    const prev = index;
    index = next;
    if (isCarouselLoopWrap(prev, next)) {
      track.style.transition = "none";
      updateTransform();
      void track.offsetHeight;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.style.removeProperty("transition");
        });
      });
    } else {
      updateTransform();
    }
  }

  function updateTransform() {
    const slide = slides[index];
    if (!slide) return;
    const vr = viewport.getBoundingClientRect();
    /** Centrer sur la colonne `.panel-inner--work`, aligné avec les pastilles (viewport plus large à droite à cause du bleed). */
    let targetX = vr.width * 0.5;
    if (workColumn) {
      const ir = workColumn.getBoundingClientRect();
      targetX = ir.left + ir.width * 0.5 - vr.left;
    }
    const w = slide.offsetWidth;
    const slideCenter = slide.offsetLeft + w / 2;
    const tx = targetX - slideCenter;
    track.style.transform = `translate3d(${tx}px, 0, 0)`;
    /** Aucun aperçu des slides à gauche de l’active : masque jusqu’au bord gauche de la carte (milieu inchangé). */
    const activeLeft = targetX - w * 0.5;
    viewport.style.setProperty("--cinema-clip-left", `${Math.max(0, activeLeft)}px`);
    root.dataset.carouselIndex = String(index);
    syncDots();
    if (document.body.dataset.fridayPanel === "0") {
      setShowcaseBackdropVisible(true);
      applyShowcaseBackdrop(slide);
    }
  }

  cinemaBleedThenRecalcTransform = updateTransform;

  function getFilterMode() {
    const inp = document.querySelector('#friday-liquid-glass input[name="friday-switcher"]:checked');
    const opt = inp?.getAttribute("data-option") ?? "0";
    if (opt === "1") return "ios";
    if (opt === "2") return "web";
    return "all";
  }

  function slideMatchesFilter(slide, mode) {
    const kind = slide.getAttribute("data-friday-filter") ?? "web";
    if (mode === "all") return true;
    if (kind === "all") return true;
    return kind === mode;
  }

  function visibleIndexFromGlobal(gIdx) {
    const el = allSlides[gIdx];
    if (!el) return 0;
    const v = slides.indexOf(el);
    if (v >= 0) return v;
    const acc = allSlides[0];
    const after = slides.find((s) => s !== acc);
    return after ? slides.indexOf(after) : 0;
  }

  function applyProjectFilter() {
    const mode = getFilterMode();
    const prevEl = slides[index];
    allSlides.forEach((s) => {
      const show = slideMatchesFilter(s, mode);
      s.classList.toggle("cinema-slide--filtered-out", !show);
      s.toggleAttribute("aria-hidden", !show);
    });
    slides = allSlides.filter((s) => !s.classList.contains("cinema-slide--filtered-out"));
    if (slides.length === 0) return;
    let newIndex = prevEl ? slides.indexOf(prevEl) : 0;
    if (newIndex < 0) newIndex = 0;
    index = newIndex;
    releaseCarouselSlideLock();
    resetWheelGestureState();
    updateTransform();
  }

  function go(delta) {
    if (slideAnimLocked) return;
    slideAnimLocked = true;
    commitCarouselIndex((index + delta + slides.length) % slides.length);
    armCarouselUnlockFallback();
  }

  function goTo(i) {
    const next = Math.max(0, Math.min(slides.length - 1, i));
    if (next === index) return;
    if (slideAnimLocked) return;
    slideAnimLocked = true;
    commitCarouselIndex(next);
    armCarouselUnlockFallback();
  }

  function resetWheelGestureState() {
    accumWheel = 0;
    wheelFlushQueued = false;
  }

  function flushWheelAccumulation() {
    wheelFlushQueued = false;
    if (document.body.dataset.fridayPanel !== "0") {
      accumWheel = 0;
      return;
    }
    if (slideAnimLocked) return;
    if (Math.abs(accumWheel) < WHEEL_ACCUM_THRESHOLD) return;

    const dir = accumWheel > 0 ? 1 : -1;
    accumWheel = 0;
    go(dir);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      releaseCarouselSlideLock();
      resetWheelGestureState();
      goTo(visibleIndexFromGlobal(Number(dot.getAttribute("data-carousel-index")) || 0));
    });
  });

  root.addEventListener(
    "click",
    (e) => {
      const el = e.target instanceof Element ? e.target.closest("[data-carousel-jump]") : null;
      if (!el || !root.contains(el)) return;
      const raw = el.getAttribute("data-carousel-jump");
      if (raw == null) return;
      const j = Number(raw);
      if (!Number.isFinite(j)) return;
      e.preventDefault();
      releaseCarouselSlideLock();
      resetWheelGestureState();
      goTo(visibleIndexFromGlobal(j));
    },
    true
  );

  viewport.addEventListener(
    "touchstart",
    (e) => {
      resetWheelGestureState();
      touchStartX = e.touches[0]?.clientX ?? null;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    (e) => {
      const endX = e.changedTouches[0]?.clientX;
      if (touchStartX == null || endX == null) return;
      const dx = endX - touchStartX;
      if (Math.abs(dx) > 42) {
        releaseCarouselSlideLock();
        resetWheelGestureState();
        go(dx < 0 ? 1 : -1);
      }
      touchStartX = null;
    },
    { passive: true }
  );

  const workPanel = root.closest(".friday-panel--work");
  const wheelZone = workPanel ?? root;

  wheelZone.addEventListener(
    "wheel",
    (e) => {
      if (document.body.dataset.fridayPanel !== "0") {
        releaseCarouselSlideLock();
        resetWheelGestureState();
        return;
      }
      if (e.ctrlKey || e.metaKey) return;

      const { dx, dy } = normalizeWheelDelta(e);
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < 0.25 && ay < 0.25) return;

      const useX = ax >= ay;
      const mag = useX ? ax : ay;
      const sign = useX ? Math.sign(dx) : Math.sign(dy);
      if (sign === 0 || mag < 0.25) return;

      e.preventDefault();

      if (slideAnimLocked) return;

      const contrib = mag * sign;
      if (accumWheel !== 0 && Math.sign(contrib) !== Math.sign(accumWheel)) {
        accumWheel = 0;
      }
      accumWheel += contrib;

      if (!wheelFlushQueued) {
        wheelFlushQueued = true;
        requestAnimationFrame(flushWheelAccumulation);
      }
    },
    { passive: false, capture: true }
  );

  const ro = new ResizeObserver(() => updateTransform());
  ro.observe(viewport);
  if (workColumn) ro.observe(workColumn);

  document.addEventListener(
    "keydown",
    (e) => {
      if (document.body.dataset.fridayPanel !== "0") return;
      if (e.key === "ArrowLeft") {
        releaseCarouselSlideLock();
        resetWheelGestureState();
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        releaseCarouselSlideLock();
        resetWheelGestureState();
        e.preventDefault();
        go(1);
      }
    },
    { passive: false }
  );

  window.addEventListener("resize", () => updateWorkCarouselViewportBleed(), { passive: true });

  const panelObs = new MutationObserver(() => {
    const active = document.querySelector(".friday-panel--work.is-active");
    if (active) requestAnimationFrame(() => updateWorkCarouselViewportBleed());
    else {
      releaseCarouselSlideLock();
      resetWheelGestureState();
    }
  });
  document.querySelectorAll(".friday-panel--work").forEach((el) => {
    panelObs.observe(el, { attributes: true, attributeFilter: ["class", "hidden"] });
  });

  const workInner = document.querySelector(".panel-inner--work");
  if (workInner && typeof ResizeObserver !== "undefined") {
    const bleedRo = new ResizeObserver(() => updateWorkCarouselViewportBleed());
    bleedRo.observe(workInner);
  }

  document.querySelector("#friday-liquid-glass fieldset.switcher")?.addEventListener("change", () => {
    releaseCarouselSlideLock();
    resetWheelGestureState();
    applyProjectFilter();
  });

  preloadShowcaseBackdropUrls(allSlides);
  applyProjectFilter();
  updateWorkCarouselViewportBleed();
}

/** Évite le scroll molette / trackpad sur la fenêtre (couche supplémentaire sur mobile). */
function lockWindowScroll() {
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.target instanceof Element && e.target.closest(".friday-panel--work")) return;
      const el = e.target instanceof Element ? e.target.closest(".friday-panel") : null;
      if (el && el.scrollHeight > el.clientHeight) return;
      e.preventDefault();
    },
    { passive: false }
  );
}

function initVisibilityPause() {
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("doc-hidden", document.hidden);
  });
}

const fieldset = document.querySelector("#friday-liquid-glass fieldset.switcher");
wireSwitcherTrackPrevious(fieldset);
initFridayNavigation();
initProjectsCarousel();
initVisibilityPause();
lockWindowScroll();

const hashKey = window.location.hash.replace(/^#/, "");
goPanel(hashKey in HASH_PANEL ? HASH_PANEL[hashKey] : 0);
