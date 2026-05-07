/**
 * Interface plein écran sans scroll : navigation par panneaux (dock / points / boutons).
 */

const PANEL_COUNT = 3;
const HASH_PANEL = { accueil: 0, realisations: 1, contact: 2 };

/** Captures « plein écran » : services publics (mshots + fallback), puis wash CSS si échec. */
function screenshotThumbUrls(siteUrl) {
  const enc = encodeURIComponent(siteUrl);
  return [
    `https://s.wordpress.com/mshots/v1/${enc}?w=1600`,
    `https://image.thum.io/get/width/1400/crop/900/noanimate/${siteUrl}`,
  ];
}

function setShowcaseBackdropVisible(visible) {
  const el = document.getElementById("friday-showcase-bg");
  if (!el) return;
  el.classList.toggle("is-visible", Boolean(visible));
  if (!visible) {
    const wrap = el.querySelector(".bg-showcase__photo-wrap");
    const img = el.querySelector(".bg-showcase__photo");
    wrap?.classList.remove("is-loaded");
    if (img) {
      img.onload = null;
      img.onerror = null;
      img.removeAttribute("src");
    }
  }
}

function applyShowcaseBackdrop(slide) {
  const root = document.getElementById("friday-showcase-bg");
  const wash = document.getElementById("friday-showcase-wash");
  const wrap = root?.querySelector(".bg-showcase__photo-wrap");
  const img = root?.querySelector(".bg-showcase__photo");
  if (!root || !wash || !wrap || !img || !slide) return;

  const key = slide.getAttribute("data-showcase-key") ?? "";
  wash.className = `bg-showcase__wash${key ? ` bg-showcase__wash--${key}` : ""}`;

  wrap.classList.remove("is-loaded");
  img.onload = null;
  img.onerror = null;

  const siteUrl = slide.getAttribute("data-showcase-url");
  if (!siteUrl) {
    img.removeAttribute("src");
    return;
  }

  const urls = screenshotThumbUrls(siteUrl);
  let attempt = 0;
  img.onload = () => wrap.classList.add("is-loaded");
  img.onerror = () => {
    attempt += 1;
    if (attempt < urls.length) {
      img.src = urls[attempt];
    } else {
      img.removeAttribute("src");
      wrap.classList.remove("is-loaded");
    }
  };

  img.fetchPriority = document.body.dataset.fridayPanel === "1" ? "high" : "low";
  img.src = urls[0];
}

function syncShowcaseBackdropForWorkPanel() {
  if (document.body.dataset.fridayPanel !== "1") {
    setShowcaseBackdropVisible(false);
    return;
  }
  const carouselRoot = document.querySelector("[data-projects-carousel]");
  const slides = carouselRoot ? [...carouselRoot.querySelectorAll("[data-carousel-slide]")] : [];
  const ci = Math.max(0, Math.min(slides.length - 1, Number(carouselRoot?.dataset.carouselIndex ?? 0)));
  setShowcaseBackdropVisible(true);
  applyShowcaseBackdrop(slides[ci]);
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

const IOS_LEAD =
  "Design et développement d’applications mobiles iOS et de sites internet — livrés avec le même soin que les grandes équipes produit.";
const WEB_LEAD =
  "Sites vitrine, landing pages et expériences web rapides — pensés pour la conversion et le référencement, avec une identité visuelle soignée.";

function heroCopyForOption(option) {
  const lead = document.getElementById("hero-lead");
  if (!lead) return;
  const next = option === "2" ? WEB_LEAD : IOS_LEAD;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    lead.textContent = next;
    return;
  }

  lead.style.opacity = "0";
  requestAnimationFrame(() => {
    lead.textContent = next;
    void lead.offsetHeight;
    requestAnimationFrame(() => {
      lead.style.opacity = "1";
    });
  });
}

function initHeroFollowSwitcher() {
  const fieldset = document.querySelector("#friday-liquid-glass fieldset.switcher");
  fieldset?.querySelectorAll('input[type="radio"]').forEach((r) => {
    r.addEventListener("change", () => {
      if (r.checked) heroCopyForOption(r.getAttribute("data-option"));
    });
  });
}

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    btn.classList.remove("icon-spin");
    void btn.offsetWidth;
    btn.classList.add("icon-spin");
    window.setTimeout(() => btn.classList.remove("icon-spin"), 560);

    document.body.classList.toggle("theme-deep");
    document.body.classList.toggle("theme-soft");
    const deep = document.body.classList.contains("theme-deep");
    btn.setAttribute("aria-label", deep ? "Passer en thème clair" : "Passer en thème bleu nuit");
  });
}

/** Dock : ordre des .dock-item — accueil, prix→contact, réalisations, Commencer→contact */
function dockPhysicalIndexForPanel(panelIdx) {
  if (panelIdx === 0) return 0;
  if (panelIdx === 1) return 2;
  return 3;
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

  if (idx === 1) syncShowcaseBackdropForWorkPanel();
  else setShowcaseBackdropVisible(false);

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
  const slides = track ? [...track.querySelectorAll("[data-carousel-slide]")] : [];
  const dotsRoot = document.querySelector("[data-carousel-dots]");
  const dots = dotsRoot ? [...dotsRoot.querySelectorAll("[data-carousel-index]")] : [];
  const prevBtn = root?.querySelector(".cinema-carousel__arrow--prev");
  const nextBtn = root?.querySelector(".cinema-carousel__arrow--next");

  if (!root || !viewport || !track || slides.length === 0) return;

  const GAP_PX = 16;
  let index = 0;
  let touchStartX = null;

  function syncDots() {
    dots.forEach((d, i) => {
      const on = i === index;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
      if (on) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function updateTransform() {
    const slide = slides[index];
    if (!slide) return;
    const v = viewport.clientWidth;
    const w = slide.offsetWidth;
    const tx = -(index * (w + GAP_PX)) + (v - w) / 2;
    track.style.transform = `translate3d(${tx}px, 0, 0)`;
    root.dataset.carouselIndex = String(index);
    syncDots();
    if (document.body.dataset.fridayPanel === "1") {
      setShowcaseBackdropVisible(true);
      applyShowcaseBackdrop(slide);
    }
  }

  function go(delta) {
    index = (index + delta + slides.length) % slides.length;
    updateTransform();
  }

  function goTo(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    updateTransform();
  }

  prevBtn?.addEventListener("click", () => go(-1));
  nextBtn?.addEventListener("click", () => go(1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => goTo(Number(dot.getAttribute("data-carousel-index")) || 0));
  });

  viewport.addEventListener(
    "touchstart",
    (e) => {
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
      if (Math.abs(dx) > 42) go(dx < 0 ? 1 : -1);
      touchStartX = null;
    },
    { passive: true }
  );

  root.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 18) return;
      e.preventDefault();
      go(e.deltaX > 0 ? 1 : -1);
    },
    { passive: false }
  );

  const ro = new ResizeObserver(() => updateTransform());
  ro.observe(viewport);

  document.addEventListener(
    "keydown",
    (e) => {
      if (document.body.dataset.fridayPanel !== "1") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    { passive: false }
  );

  window.addEventListener("resize", () => updateTransform(), { passive: true });

  const panelObs = new MutationObserver(() => {
    const active = document.querySelector(".friday-panel--work.is-active");
    if (active) requestAnimationFrame(() => updateTransform());
  });
  document.querySelectorAll(".friday-panel--work").forEach((el) => {
    panelObs.observe(el, { attributes: true, attributeFilter: ["class", "hidden"] });
  });

  updateTransform();
}

/** Évite le scroll molette / trackpad sur la fenêtre (couche supplémentaire sur mobile). */
function lockWindowScroll() {
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.target instanceof Element && e.target.closest("[data-projects-carousel]")) return;
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
initHeroFollowSwitcher();
initThemeToggle();
initFridayNavigation();
initProjectsCarousel();
initVisibilityPause();
lockWindowScroll();

const hashKey = window.location.hash.replace(/^#/, "");
goPanel(hashKey in HASH_PANEL ? HASH_PANEL[hashKey] : 0);
