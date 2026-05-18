"use client";

import Link from "next/link";

export const PROMO_SLIDES = [
  {
    badge: "Avec mise à jour",
    title: "PROMPTS XCODE",
    copy: "Des prompts Xcode prêts à coller, structurés par phase de build.",
    label: "Prompts Xcode",
  },
  {
    badge: "Nouveau",
    title: "XCODE EXPRESS",
    copy: "Passe vite du squelette fonctionnel aux écrans clés sans te perdre dans la doc.",
    label: "Xcode express",
  },
  {
    badge: "Avec données",
    title: "TRACKER ADS",
    copy: "Inspire-toi avec les creatives et tendances depuis le tracker intégré.",
    label: "Tracker Ads",
  },
  {
    badge: "Studio",
    title: "ATELIER VISUEL",
    copy: "Génération d’assets et itérations créatives sans quitter Trackapp.",
    label: "Atelier visuel",
  },
] as const;

export function TaAuthSuspended() {
  return (
    <div className="ta-auth-root">
      <div className="ta-auth-modal flex min-h-[200px] items-center justify-center">
        <p className="px-10 py-14 text-[14px] text-white/40">Chargement…</p>
      </div>
    </div>
  );
}

export function SvgGoogle() {
  return (
    <svg className="ta-auth-oauth-ico" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SvgApple() {
  return (
    <svg className="ta-auth-oauth-ico text-white" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.961-1.04-2.04.027-3.909 1.183-4.961 3.014-2.117 3.675-.546 9.129 1.516 12.089 1.013 1.454 2.208 1.65 3.737 1.65 1.515 0 2.376-.638 3.438-.638 1.09 0 1.892.638 3.122.638 1.858 0 2.95-1.213 3.608-2.276.217-.348.439-.694.659-1.076-2.349-1.172-3.849-3.348-3.849-5.771 0-2.239 1.243-4.154 3.157-5.169-.389-1.056-1.172-2.143-2.233-2.886-1.411-1.008-2.854-1.184-3.949-1.184zm.224-2.142c.93.046 1.948.459 2.668 1.122.783.694 1.282 1.579 1.419 2.652-1.707.183-3.279-.849-4.086-2.346-.186-.369-.389-.923-.389-1.428z" />
    </svg>
  );
}

export function SvgMicrosoft() {
  return (
    <svg className="ta-auth-oauth-ico" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

export function SvgMail() {
  return (
    <svg className="ta-auth-oauth-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M4 7v11h16V7M4 7l8 7 8-7"
      />
    </svg>
  );
}

export function SvgCloudSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(142 142 147)" aria-hidden>
      <path
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 17a4 4 0 0 1-1.967-7.478A4 4 0 1 1 17 13h-4"
      />
    </svg>
  );
}

export function SvgAudio() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 10v4a1 1 0 001 1h3l4 3V6L7 9H4a1 1 0 00-1 1z" />
      <path d="M16 8.5c1.333 1.333 2 3.167 2 5.5s-.667 4.167-2 5.5M14 11c.764.764 1.147 2.068 1.147 4s-.383 3.236-1.147 4" opacity="0.45" />
    </svg>
  );
}

export function TrackappLimeLogo() {
  return (
    <div className="ta-auth-mark" aria-hidden="true">
      <div className="ta-auth-mark__inner">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
          <title>Trackapp</title>
          <path
            d="M10 26c9-12 17-21 17-26M6 26C16 13 26 10 31 26"
            stroke="#0f0f0f"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="7" r="2.35" fill="#0f0f0f" />
        </svg>
      </div>
    </div>
  );
}

function resolveHeroUrl(explicit?: string | null): string | null {
  const env =
    typeof process.env.NEXT_PUBLIC_TRACKAPP_AUTH_HERO === "string" ?
      process.env.NEXT_PUBLIC_TRACKAPP_AUTH_HERO.trim()
    : "";
  const v = (explicit ?? "").trim() || env;
  return v.length ? v : null;
}

export function PromoPanel({
  active,
  promoImageSrc,
}: Readonly<{ active: number; promoImageSrc?: string | null }>) {
  const slide = PROMO_SLIDES[Math.max(0, Math.min(active, PROMO_SLIDES.length - 1))];
  const hero = resolveHeroUrl(promoImageSrc);

  return (
    <aside className="ta-auth-promo-pane" aria-label="Découvrir Trackapp">
      <div className="ta-auth-promo-bg">
        {hero ?
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL hero dynamique */}
            <img src={hero} alt="" className="h-full w-full object-cover" />
            <div className="ta-auth-promo-grad" />
          </>
        : <>
            <div className="ta-auth-promo-bg-placeholder" aria-hidden />
            <div className="ta-auth-promo-grad" />
          </>
        }
      </div>
      <div className="ta-auth-promo-bottom">
        <div className="ta-meta-pill">
          <SvgAudio />
          {slide.badge}
        </div>
        <h3 className="ta-carousel-title">{slide.title}</h3>
        <p className="ta-carousel-copy">{slide.copy}</p>
        <div className="ta-carousel-bars" role="presentation">
          {PROMO_SLIDES.map((s, i) => (
            <div key={`bar-${i}-${s.label}`} className={`ta-carousel-bar${i === active ? " is-active" : ""}`} />
          ))}
        </div>
        <div className="ta-carousel-labels" role="presentation">
          {PROMO_SLIDES.map((s, i) => (
            <div key={`lbl-${i}-${s.label}`} className={`ta-carousel-label${i === active ? " is-active" : ""}`}>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function TaAuthLegalFooter() {
  return (
    <p className="ta-auth-legal">
      En continuant, je confirme avoir lu la{" "}
      <Link href="/trackapp/legal/privacy">Politique de confidentialité</Link>{" "}
      et j&apos;accepte les <Link href="/trackapp/legal/terms">Conditions d&apos;utilisation</Link>.
      Je confirme également avoir au moins 18 ans.
    </p>
  );
}
