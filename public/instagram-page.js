/** Thème clair/sombre réutilisable (page Instagram seule). */
(function () {
  const key = "trackapp-theme-instagram";

  function apply(stored) {
    document.body.classList.remove("theme-deep", "theme-soft");
    document.body.classList.add(stored === "soft" ? "theme-soft" : "theme-deep");
  }

  apply(localStorage.getItem(key) === "soft" ? "soft" : "deep");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "glass-icon-btn glass-icon-btn--round instagram-theme-btn";
  btn.setAttribute("aria-label", "Changer le thème");
  btn.innerHTML = `
    <svg class="icon-sun" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.75" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </svg>
    <svg class="icon-moon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" fill="none" stroke="currentColor" stroke-width="1.75"
        stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  const header = document.querySelector(".instagram-header__actions");
  if (header) header.prepend(btn);

  function syncIcons() {
    const deep = document.body.classList.contains("theme-deep");
    btn.querySelector(".icon-sun").style.display = deep ? "block" : "none";
    btn.querySelector(".icon-moon").style.display = deep ? "none" : "block";
    btn.setAttribute("aria-label", deep ? "Passer en thème clair" : "Passer en thème bleu nuit");
  }

  syncIcons();

  btn.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-deep") ? "soft" : "deep";
    localStorage.setItem(key, next === "soft" ? "soft" : "deep");
    apply(next);
    syncIcons();
  });
})();
