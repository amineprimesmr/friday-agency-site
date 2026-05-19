/**
 * Configuration du fil Instagram (page instagram.html).
 *
 * 1. Renseigne `profileUrl` avec l’URL de ton profil public.
 * 2. Ajoute dans `postUrls` les liens de chaque publication à afficher
 *    (copie depuis l’app ou le navigateur : https://www.instagram.com/p/… ou /reel/…).
 *
 * Instagram ne fournit pas la liste complète des posts sans API Meta (compte pro + token).
 * Tu peux coller ici autant d’URLs que tu veux : elles s’affichent en grille sur la page.
 */
window.TRACKAPP_INSTAGRAM = {
  profileUrl: "https://www.instagram.com/",
  /** @type {string[]} */
  postUrls: [],
  /**
   * Publications locales (fond image + bouton liquid glass en bas).
   * @type {{ image: string; imageSrcSet?: string; imageSizes?: string; ctaLabel?: string; ctaHref?: string; exportFileName?: string; backgroundBlurPx?: number }[]}
   *
   * Pour une qualité max sur Retina / grands écrans : fournis une image large (ex. 3840px de large)
   * dans `image`, ou plusieurs résolutions via imageSrcSet + imageSizes (attributs HTML natifs).
   */
  nativePosts: [
    {
      image: "/assets/banner.jpg",
      ctaLabel: "trackapp.fr",
      ctaHref: "https://trackapp.fr/",
      exportFileName: "trackapp-post",
      /** Flou initial du fond (0–24 px). Réglable ensuite avec le curseur sous la carte. */
      backgroundBlurPx: 0,
    },
  ],
};
