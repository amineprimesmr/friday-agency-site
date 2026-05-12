import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "TikTok Developer Portal — copy texts · Trackapp",
};

function baseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (raw && /^https?:\/\//i.test(raw)) return raw;
  return "https://trackapp.fr";
}

const DESCRIPTION_120 =
  "Trackapp is a web app for mobile app intelligence: rankings & optional public ad insights via TikTok Research API.";

const PRODUCT_SCOPE_1000 = `Trackapp is a web dashboard for mobile app analysts (trackapp.fr).

Integration: TikTok Commercial Content / Research API — server-side only. Our backend exchanges client credentials for an access token and queries allowed Ad Library endpoints (scope research.adlib.basic when approved). Public commercial ad metadata appears in authenticated Trackapp screens (competitive creatives). Client secrets stay on the server.

Auth: Trackapp uses Supabase for user login. TikTok Login Kit is not required for this library view.

Compliance: We follow TikTok rate limits, field restrictions, and storage rules for API output.

Demo video: HTTPS site → sign in → open Ads intelligence tab with TikTok results (or clear sandbox/API message). Show network calls to our domain only; never film .env or secrets.

If Products/Scopes change, update this text and re-record the demo.`;

export default function TikTokPortalHelperPage() {
  const origin = baseUrl();
  const termsUrl = `${origin}/trackapp/legal/terms`;
  const privacyUrl = `${origin}/trackapp/legal/privacy`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-[14px] leading-relaxed text-white/78">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">Internal helper</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">TikTok Developer Portal — champs à copier</h1>
      <p className="mt-3 text-[13px] text-white/45">
        BASE URL utilisée : <span className="font-mono text-white/70">{origin}</span> (via{" "}
        <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_APP_URL</code>). Les pages légales EN doivent répondre en{" "}
        <strong className="text-white/80">200</strong> sur la prod avant soumission.
      </p>

      <section className="mt-10 space-y-4 rounded-xl border border-white/12 bg-white/[0.04] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-200/90">
          Commercial Content API — ce que dit la doc officielle
        </h2>
        <p className="text-[13px] text-white/55">
          Résumé de{" "}
          <a
            href="https://developers.tiktok.com/doc/commercial-content-api-getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 underline-offset-2 hover:underline"
          >
            Getting Started
          </a>{" "}
          +{" "}
          <a
            href="https://developers.tiktok.com/products/commercial-content-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 underline-offset-2 hover:underline"
          >
            produit Commercial Content API
          </a>
          . Trackapp implémente déjà le flux technique (serveur) dans{" "}
          <code className="rounded bg-black/30 px-1 text-[11px]">src/lib/tiktok-ad-library.ts</code> — à brancher après approbation
          TikTok.
        </p>
        <ol className="list-decimal space-y-2 ps-5 text-[13px] text-white/70 marker:text-white/45">
          <li>
            Compte développeur :{" "}
            <a href="https://developers.tiktok.com/signup" className="text-violet-300 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
              inscription
            </a>
            .
          </li>
          <li>
            <strong className="text-white/85">Demande d&apos;accès obligatoire</strong> : remplis le formulaire officiel{" "}
            <a
              href="https://developers.tiktok.com/application/commercial-content-api"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] text-sky-300 underline-offset-2 hover:underline"
            >
              developers.tiktok.com/application/commercial-content-api
            </a>
            . Réponse sous ~2 jours ouvrés (email possible depuis commercial-research-questions@tiktok.com).
          </li>
          <li>
            Une fois <strong className="text-white/85">approuvé</strong> : un{" "}
            <strong className="text-white/85">research client</strong> est créé. Va sur{" "}
            <a href="https://developers.tiktok.com/research/" target="_blank" rel="noopener noreferrer" className="text-violet-300 underline-offset-2 hover:underline">
              developers.tiktok.com/research/
            </a>
            , ouvre ton projet → récupère <strong className="text-white/85">Client key</strong> +{" "}
            <strong className="text-white/85">Client secret</strong> (icône œil).
          </li>
          <li>
            <strong className="text-white/85">Jeton</strong> : obtention via OAuth{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">client_credentials</code> (voir{" "}
            <a href="https://developers.tiktok.com/doc/client-access-token-management" target="_blank" rel="noopener noreferrer" className="text-violet-300 underline-offset-2 hover:underline">
              Client Access Token Management
            </a>
            ). Trackapp le fait automatiquement avec{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">TIKTOK_CLIENT_KEY</code> /{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">TIKTOK_CLIENT_SECRET</code>.
          </li>
          <li>
            <strong className="text-white/85">Requête ads</strong> :{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">POST</code>{" "}
            <code className="break-all rounded bg-black/30 px-1 text-[11px]">
              https://open.tiktokapis.com/v2/research/adlib/ad/query/
            </code>{" "}
            avec header <code className="rounded bg-black/30 px-1 text-[11px]">Authorization: Bearer &lt;token&gt;</code>, corps JSON{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">filters.ad_published_date_range</code>,{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">country_code</code>,{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">search_term</code>, pagination{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">search_id</code>. Identique à ton endpoint{" "}
            <code className="rounded bg-black/30 px-1 text-[11px]">/api/tiktok/ad-library</code>.
          </li>
        </ol>
        <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-50/95">
          TikTok indique qu&apos;en phase actuelle les données commerciales exposées concernent surtout les pubs ayant touché l&apos;
          <strong>UE</strong> ; élargissement géographique annoncé progressivement. Pour les tests API, privilégie un{" "}
          <code className="rounded bg-black/25 px-1">country_code</code> UE (ex. <code className="rounded bg-black/25 px-1">FR</code>
          , <code className="rounded bg-black/25 px-1">IT</code>) comme dans leurs exemples.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">App details — Description (≤120)</h2>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/12 bg-black/40 p-4 text-[13px] text-emerald-100/90">
          {DESCRIPTION_120}
        </pre>
        <p className="text-[12px] text-white/38">{DESCRIPTION_120.length} caractères</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">Terms of Service URL</h2>
        <pre className="overflow-x-auto rounded-xl border border-white/12 bg-black/40 p-4 font-mono text-[13px] text-sky-100/95">
          {termsUrl}
        </pre>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">Privacy Policy URL</h2>
        <pre className="overflow-x-auto rounded-xl border border-white/12 bg-black/40 p-4 font-mono text-[13px] text-sky-100/95">
          {privacyUrl}
        </pre>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">Platforms</h2>
        <p className="text-white/60">
          Coche <strong className="text-white">Web</strong> (Trackapp est un site Next.js). Ne coche mobile que si tu distribues
          une app native qui embarque le même flux.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">App review — Product &amp; scope (≤1000)</h2>
        <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/12 bg-black/40 p-4 text-[12px] leading-relaxed text-violet-100/90">
          {PRODUCT_SCOPE_1000}
        </pre>
        <p className="text-[12px] text-white/38">{PRODUCT_SCOPE_1000.length} caractères</p>
      </section>

      <section className="mt-10 space-y-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-[13px] text-amber-50/95">
        <h2 className="font-semibold text-amber-100">Vidéo démo (tu dois la faire)</h2>
        <ol className="mt-2 list-decimal space-y-1.5 ps-5">
          <li>mp4 ou mov, ≤50 Mo — montre l’URL HTTPS réelle (trackapp.fr ou preview Vercel).</li>
          <li>Connexion → page où les pubs TikTok s’affichent (ou message d’erreur API si sandbox).</li>
          <li>Ne filme jamais Client Secret / .env.local.</li>
        </ol>
      </section>

      <section className="mt-10 space-y-2 text-[13px] text-white/45">
        <p>
          Pages légales :{" "}
          <Link href="/trackapp/legal/terms" className="text-violet-300 underline-offset-2 hover:underline">
            Terms
          </Link>
          {" · "}
          <Link href="/trackapp/legal/privacy" className="text-violet-300 underline-offset-2 hover:underline">
            Privacy
          </Link>
        </p>
      </section>
    </main>
  );
}
