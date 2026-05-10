# Friday — vitrine + App Tracker + SaaS

Monorepo [Next.js](https://nextjs.org) 15 (App Router, React 19, Tailwind CSS v4) : réécriture de la racine vers la **vitrine statique** (`public/legacy-agency/`), **App Store Tracker** (`/tracker`), routes API (Stripe, auth JWT), et assets statiques (`public/`).

## Prérequis

- Node.js **20.9** – **23.x** (voir `package.json` → `engines`)

## Démarrage

```bash
cp .env.example .env.local
npm install
npm run dev
```

- [http://localhost:3000](http://localhost:3000) — en dev, page Next minimaliste avec liens vitrine / tracker (en prod, `/` est réécrit vers la vitrine HTML).
- Variables Stripe / JWT : voir `.env.example`.

## Scripts

| Commande          | Rôle                          |
|-------------------|-------------------------------|
| `npm run dev`     | Serveur de développement      |
| `npm run build`   | Build production                |
| `npm run start`   | Serveur après build             |
| `npm run lint`    | ESLint (sources Next uniquement)|
| `npm run typecheck` | `tsc --noEmit`              |
| `npm run clean`   | Supprime `.next`               |

## Organisation du dépôt

| Chemin | Contenu |
|--------|---------|
| `src/app/` | App Router : layouts, pages dynamiques, `globals.css` |
| `src/styles/` | Feuilles CSS additionnelles importées par `globals.css` |
| `src/components/` | UI réutilisable (`site-*`, `tracker/*`) |
| `src/lib/` | Logique métier (Apple charts, Stripe, session, etc.) |
| `public/legacy-agency/` | Vitrine HTML/CSS/JS servie à `/` (rewrite Next) |
| `public/assets/` | Images servies sous `/assets/*` (logo, fonds vitrine, Instagram) |
| `public/` | Pages statiques (`instagram.html`, scripts associés, widget tracker) |

Ne pas recréer de dossiers dupliqués à la racine (`assets/`, `legacy/`) : tout ce qui est servi au navigateur vit sous **`public/`**.

## Déploiement (Vercel)

Configurer les variables de `.env.example` dans le projet Vercel. `NEXT_PUBLIC_APP_URL` doit être l’URL publique (redirections Stripe, métadonnées).

Après `npm ci` sur une machine propre : si des dossiers vides apparaissent sous `node_modules/@types/` avec des noms du type `react 2`, les supprimer — ils cassent `tsc` (artefacts « copie Finder », pas des vrais paquets).
