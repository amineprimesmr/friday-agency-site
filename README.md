# Trackapp — App Store Tracker + SaaS

Monorepo [Next.js](https://nextjs.org) 15 (App Router, React 19, Tailwind CSS v4) pour **Trackapp** : App Store Tracker public (`/tracker`), espace SaaS (`/trackapp/*`), routes API (Stripe, Supabase, Meta/TikTok) et assets statiques (`public/`).

## Prérequis

- Node.js **20.9** – **23.x** (voir `package.json` → `engines`)

## Démarrage

```bash
npm install
npm run setup:local    # .env.local (URL locale, bypass dev, clés Supabase si CLI liée)
# Si Supabase manque : supabase login && supabase link --project-ref djdelmktmnjaybvjcudm --yes && npm run setup:local
npm run dev:open       # http://127.0.0.1:3000/trackapp
```

- **Landing** : [http://127.0.0.1:3000/trackapp](http://127.0.0.1:3000/trackapp) (`/` redirige ici).
- **Sans Supabase** : AppLAB + onboarding OK ; connexion / Google nécessitent les clés dans `.env.local`.
- **Sans login en local** : middleware désactivé en dev → liens « Explorer le SaaS » ou `/trackapp/apptracker`.
- Auth callback local : `http://127.0.0.1:3000/trackapp/auth/callback` (Supabase → URL Configuration).

## Scripts

| Commande          | Rôle                          |
|-------------------|-------------------------------|
| `npm run setup:local` | Prépare `.env.local` pour le dev |
| `npm run dev`     | Serveur de développement      |
| `npm run dev:open` | Dev + ouvre `/trackapp` dans le navigateur |
| `npm run dev:reset` | Clean `.next` + redémarre le dev |
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
| `src/components/` | UI réutilisable (`tracker/*`, `trackapp/*`) |
| `src/lib/` | Logique métier (Apple charts, Stripe, session, etc.) |
| `public/assets/` | Images et vidéos servies sous `/assets/*` |
| `public/` | Pages statiques (`instagram.html`, scripts associés, widget tracker) |

Ne pas recréer de dossiers dupliqués à la racine (`assets/`, `legacy/`) : tout ce qui est servi au navigateur vit sous **`public/`**.

## Déploiement (Vercel)

Configurer les variables de `.env.example` dans le projet Vercel. `NEXT_PUBLIC_APP_URL` doit rester l’URL canonique publique : `https://trackapp.fr`.

### Git branchée sur le bon repo

Dans **Vercel → Project → Settings → Git**, le dépôt Git doit être **celui de ce monorepo** (branche **`main`**). Sinon les `git push` ne déclenchent aucun déploiement : le tableau affiche un ancien commit (`5915fa0`, etc.) alors que GitHub est déjà sur un commit plus récent.

### Aperçu « 403 Forbidden » dans le dashboard Vercel

Ce n’est en général **pas** une erreur applicative : **Deployment Protection** (authentification Vercel sur les URLs de preview) renvoie 403 aux iframes / visiteurs non connectés. Pour un site public : **Project → Settings → Deployment Protection** — désactiver l’auth obligatoire sur les previews si besoin, ou ouvrir l’URL du déploiement dans un onglet (session Vercel connectée).

Après `npm ci` sur une machine propre : si des dossiers vides apparaissent sous `node_modules/@types/` avec des noms du type `react 2`, les supprimer — ils cassent `tsc` (artefacts « copie Finder », pas des vrais paquets).
