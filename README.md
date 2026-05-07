# Friday — vitrine agence

Site statique (HTML / CSS / JS) pour **Friday** : navigation plein écran par panneaux, carousel réalisations, déploiement **Vercel**.

**Dépôt GitHub :** https://github.com/amineprimesmr/friday-agency-site

## URL production

- **https://friday-agency-site.vercel.app**

## Développement local

```bash
npm run dev
```

Puis ouvrir http://localhost:8888 (ou le port indiqué par `serve`).

## Fonds « Réalisations »

Le fond derrière le carousel affiche une **capture** du site (pas une iframe : la plupart des sites bloquent l’intégration avec `X-Frame-Options` ou une CSP).

Par défaut, le script essaie deux services publics (WordPress mshots, puis thum.io) à partir de `data-showcase-url`. Ces URLs sont souvent lentes ou indisponibles ; dans ce cas tu ne vois que le dégradé (wash).

Pour afficher une **vraie capture** :

1. Exporte une image (WebP ou JPG, ~1600×900), via une capture d’écran ou par exemple Playwright :  
   `npx playwright screenshot https://example.com assets/showcase/exemple.webp --viewport-size=1440,900`
2. Place le fichier dans `assets/showcase/`.
3. Sur la carte correspondante dans `index.html`, ajoute par exemple :  
   `data-showcase-image="./assets/showcase/exemple.webp"`

Tu peux lister plusieurs chemins séparés par une virgule ; la première image qui charge correctement est utilisée.

## Déploiement production (CLI)

Depuis la racine du projet (compte Vercel déjà lié via `.vercel/` local, ignoré par Git) :

```bash
npm run deploy
```

Première fois sur une machine sans lien :

```bash
npx vercel@latest link
npm run deploy
```

## GitHub → Vercel (CI continu)

1. Pousser ce repo sur GitHub (déjà fait si tu suis l’historique du projet).
2. Dans [Vercel Dashboard](https://vercel.com) → **Add New Project** → **Import** le dépôt GitHub.
3. Framework : **Other**, répertoire racine : `.`, build : aucune (static).
4. Les prochains **push** sur `main` redéploient automatiquement.

Variables d’environnement : aucune requise pour ce site.

## Domaine personnalisé

Vercel → projet **friday-agency-site** → **Settings** → **Domains** → ajouter `friday.studio` (ou autre) et suivre les enregistrements DNS indiqués.

Après ajout d’un domaine, mettre à jour dans le repo :

- `canonical` + meta Open Graph dans `index.html`
- URLs dans `sitemap.xml` et `robots.txt`

---

© Friday — agence digitale.
