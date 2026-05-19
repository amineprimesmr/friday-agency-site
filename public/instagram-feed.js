/**
 * Embeds Instagram (postUrls) + cartes locales (nativePosts).
 */

const HTML_TO_IMAGE_SRC = "https://esm.sh/html-to-image@1.11.11";

async function exportNativePostAsPng(targetEl, button) {
  if (!targetEl || button?.dataset?.busy === "1") return;

  const label = button.querySelector(".instagram-native-download__label");
  const prevLabel = label?.textContent ?? "";

  button.dataset.busy = "1";
  button.disabled = true;
  if (label) label.textContent = "Export…";

  try {
    const { toBlob } = await import(HTML_TO_IMAGE_SRC);
    const blob = await toBlob(targetEl, {
      pixelRatio: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
      cacheBust: true,
      backgroundColor: null,
    });

    if (!blob) throw new Error("toBlob returned empty");

    const name =
      typeof targetEl.dataset?.exportName === "string" && targetEl.dataset.exportName.trim()
        ? `${targetEl.dataset.exportName.trim().replace(/[^\w.-]+/g, "_")}.png`
        : `trackapp-post-${Date.now()}.png`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert(
      "Impossible d’exporter l’image pour le moment. Vérifie ta connexion ou réessaie avec un autre navigateur."
    );
  } finally {
    button.disabled = false;
    button.dataset.busy = "0";
    if (label) label.textContent = prevLabel || "Télécharger le post";
  }
}

function parseInstagramEmbedPath(url) {
  try {
    const u = new URL(url.trim(), "https://www.instagram.com");
    const m = u.pathname.match(/^\/(p|reel|tv)\/([^/]+)\/?/i);
    if (!m) return null;
    const kind = m[1].toLowerCase() === "reel" || m[1].toLowerCase() === "tv" ? m[1].toLowerCase() : "p";
    const id = m[2];
    return `/${kind}/${id}/embed/`;
  } catch {
    return null;
  }
}

function createNativePostCard(post, nativeIndex = 0) {
  const imgSrc = post.image?.trim();
  if (!imgSrc) return null;

  const ctaHref =
    typeof post.ctaHref === "string" && post.ctaHref.trim()
      ? post.ctaHref.trim()
      : "https://trackapp.fr/";
  const ctaLabel =
    typeof post.ctaLabel === "string" && post.ctaLabel.trim()
      ? post.ctaLabel.trim()
      : "trackapp.fr";

  const article = document.createElement("article");
  article.className = "instagram-native-post";

  const inner = document.createElement("div");
  inner.className = "instagram-native-post__inner";

  const media = document.createElement("div");
  media.className = "instagram-native-post__media";

  const bgImg = document.createElement("img");
  bgImg.className = "instagram-native-post__img";
  bgImg.alt = "";
  bgImg.decoding = "async";
  bgImg.loading = nativeIndex > 0 ? "lazy" : "eager";
  if (nativeIndex === 0) bgImg.fetchPriority = "high";
  bgImg.src = imgSrc;
  const srcSet = typeof post.imageSrcSet === "string" ? post.imageSrcSet.trim() : "";
  const sizes = typeof post.imageSizes === "string" ? post.imageSizes.trim() : "";
  if (srcSet) bgImg.srcSet = srcSet;
  if (sizes) bgImg.sizes = sizes;

  const blurConfigured = Number(post.backgroundBlurPx);
  const blurInitial = Number.isFinite(blurConfigured)
    ? Math.max(0, Math.min(24, blurConfigured))
    : 0;

  function applyBackgroundBlur(px) {
    const v = Math.max(0, Math.min(24, px));
    if (v <= 0) {
      bgImg.style.filter = "";
      bgImg.style.transform = "";
    } else {
      bgImg.style.filter = `blur(${v}px)`;
      bgImg.style.transform = "scale(1.08)";
    }
  }

  const footer = document.createElement("div");
  footer.className = "instagram-native-post__footer";

  const cta = document.createElement("a");
  cta.className = "glass-btn instagram-native-cta";
  cta.href = ctaHref;
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  cta.setAttribute("aria-label", `${ctaLabel} — ouvrir Trackapp`);

  const label = document.createElement("span");
  label.className = "instagram-native-cta__label";
  label.textContent = ctaLabel;

  cta.appendChild(label);
  footer.appendChild(cta);

  media.appendChild(bgImg);
  inner.appendChild(media);
  inner.appendChild(footer);
  article.appendChild(inner);

  const wrap = document.createElement("div");
  wrap.className = "instagram-native-wrap";
  wrap.dataset.exportName =
    typeof post.exportFileName === "string" && post.exportFileName.trim()
      ? post.exportFileName.trim()
      : "trackapp-post";
  wrap.appendChild(article);

  applyBackgroundBlur(blurInitial);

  const blurId = `trackapp-bg-blur-${Math.random().toString(36).slice(2, 11)}`;
  const controls = document.createElement("div");
  controls.className = "instagram-native-blur-controls";

  const blurLabel = document.createElement("label");
  blurLabel.className = "instagram-native-blur-label";
  blurLabel.htmlFor = blurId;
  blurLabel.textContent = "Flou du fond";

  const blurRange = document.createElement("input");
  blurRange.type = "range";
  blurRange.id = blurId;
  blurRange.className = "instagram-native-blur-range";
  blurRange.min = "0";
  blurRange.max = "24";
  blurRange.step = "1";
  blurRange.value = String(blurInitial);
  blurRange.setAttribute("aria-valuemin", "0");
  blurRange.setAttribute("aria-valuemax", "24");
  blurRange.setAttribute("aria-valuenow", String(blurInitial));

  const blurValue = document.createElement("span");
  blurValue.className = "instagram-native-blur-value";
  blurValue.setAttribute("aria-live", "polite");
  blurValue.textContent = `${blurInitial}px`;

  blurRange.addEventListener("input", () => {
    const v = Number(blurRange.value);
    applyBackgroundBlur(Number.isFinite(v) ? v : 0);
    blurValue.textContent = `${Math.round(Number(blurRange.value))}px`;
    blurRange.setAttribute("aria-valuenow", String(Math.round(Number(blurRange.value))));
  });

  controls.appendChild(blurLabel);
  controls.appendChild(blurRange);
  controls.appendChild(blurValue);

  const actions = document.createElement("div");
  actions.className = "instagram-native-actions";

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "glass-btn instagram-native-download";
  downloadBtn.setAttribute("aria-label", "Télécharger ce post en image PNG");

  const dlLabel = document.createElement("span");
  dlLabel.className = "instagram-native-download__label";
  dlLabel.textContent = "Télécharger le post";

  downloadBtn.appendChild(dlLabel);
  downloadBtn.addEventListener("click", () => exportNativePostAsPng(wrap, downloadBtn));

  actions.appendChild(downloadBtn);

  const stack = document.createElement("div");
  stack.className = "instagram-native-stack";
  stack.appendChild(wrap);
  stack.appendChild(controls);
  stack.appendChild(actions);

  return stack;
}

function render() {
  const cfg = window.TRACKAPP_INSTAGRAM;
  const grid = document.getElementById("instagram-grid");
  const empty = document.getElementById("instagram-empty");
  const profileLink = document.getElementById("instagram-profile-link");

  if (!grid || !empty) return;

  if (profileLink && cfg?.profileUrl) {
    profileLink.href = cfg.profileUrl;
  }

  const urls = Array.isArray(cfg?.postUrls) ? cfg.postUrls.filter(Boolean) : [];
  const natives = Array.isArray(cfg?.nativePosts) ? cfg.nativePosts : [];

  if (urls.length === 0 && natives.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  const frag = document.createDocumentFragment();

  natives.forEach((post, nativeIndex) => {
    const node = createNativePostCard(post, nativeIndex);
    if (node) frag.appendChild(node);
  });

  for (const url of urls) {
    const path = parseInstagramEmbedPath(url);
    if (!path) continue;

    const wrap = document.createElement("div");
    wrap.className = "instagram-embed-wrap";

    const iframe = document.createElement("iframe");
    iframe.className = "instagram-embed";
    iframe.title = "Publication Instagram";
    iframe.src = `https://www.instagram.com${path}`;
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute(
      "allow",
      "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
    );

    wrap.appendChild(iframe);
    frag.appendChild(wrap);
  }

  grid.appendChild(frag);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", render);
} else {
  render();
}
