# Friday — SaaS « apps à copier-coller »

Application [Next.js](https://nextjs.org) (App Router, React 19, Tailwind CSS v4, Framer Motion) : landing marketing, catalogue filtrable façon tracker, fiches playbook, paiement **Stripe Checkout** (abonnement) et session membre via cookie JWT signé.

## Démarrage

```bash
cp .env.example .env.local
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

- En développement, sans Stripe : utiliser la barre ambre **« Simuler un abonnement »** (cookie membre).
- En production : renseigner `SUBSCRIPTION_SECRET`, les clés Stripe et les `STRIPE_PRICE_ID_*`. Configurer le webhook `POST /api/webhooks/stripe` si besoin.

## Scripts

| Commande        | Rôle                      |
|----------------|---------------------------|
| `npm run dev`  | Serveur de développement |
| `npm run build`| Build production           |
| `npm run start`| Serveur après build      |
| `npm run lint` | ESLint                     |

## Structure utile

- `src/app` — pages (`/`, `/explorer`, `/apps/[slug]`, `/pricing`, `/dashboard`) et routes API (`checkout`, auth Stripe, webhook).
- `src/lib/catalog.ts` — données catalogue (à enrichir avec vos ~50 apps).
- `src/components` — UI réutilisable (cartes, motion, checkout).
- `legacy/agency` — ancienne vitrine statique ; copie servie sous `/legacy-agency/`.
- `public/instagram.html` — page Instagram (CSS `/styles.css`).

## Déploiement Vercel

Définir les variables d’environnement du tableau `.env.example` dans le projet Vercel. `NEXT_PUBLIC_APP_URL` doit être l’URL publique (pour les redirections Stripe).
