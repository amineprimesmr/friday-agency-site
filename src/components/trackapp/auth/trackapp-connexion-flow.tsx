"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import {
  PROMO_SLIDES,
  PromoPanel,
  SvgApple,
  SvgGoogle,
  SvgMicrosoft,
  SvgCloudSmall,
  TaAuthLegalFooter,
  TaAuthSuspended,
  TrackappLimeLogo,
} from "@/components/trackapp/auth/trackapp-auth-shared";
import { createClient } from "@/lib/supabase/client";

function ConnexionExperienceInner({
  nextHrefSafe,
}: Readonly<{ nextHrefSafe: string }>) {
  const sb = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % PROMO_SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const callbackUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ?
        window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "");
    const nextEnc = encodeURIComponent(nextHrefSafe);
    return `${origin}/trackapp/auth/callback?next=${nextEnc}`;
  }, [nextHrefSafe]);

  const oauth = useCallback(
    async (provider: "google" | "apple" | "azure") => {
      if (!sb) return;
      setBusy(true);
      setError(null);
      const { error: oErr } = await sb.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
          queryParams: provider === "google" ? { prompt: "select_account" } : {},
        },
      });
      setBusy(false);
      if (oErr) setError(oErr.message ?? `Connexion ${provider} indisponible (Supabase).`);
    },
    [sb, callbackUrl],
  );

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!sb) {
      setError("Configurer Supabase (NEXT_PUBLIC_SUPABASE_URL / ANON).");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: authErr } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authErr) {
      setError(authErr.message ?? "Erreur de connexion.");
      return;
    }
    router.refresh();
    router.push(nextHrefSafe);
  }

  if (!sb) {
    return (
      <div className="ta-auth-root">
        <div className="rounded-3xl border border-white/14 bg-neutral-950/90 p-12 text-[14px] text-white/55">
          Définissez <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </div>
      </div>
    );
  }

  const closeHref = "/tracker";
  const disabled = busy || !email || !password;

  return (
    <div className="ta-auth-root ta-font">
      <div className="ta-auth-modal relative">
        <Link href={closeHref} className="ta-auth-close" prefetch={false} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>

        <div className="ta-auth-pane ta-auth-pane--with-back">
          <Link href="/trackapp/inscription" prefetch={false} className="ta-auth-back" aria-label="Retour">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m15 6-9 9 9 9" />
            </svg>
          </Link>

          <TrackappLimeLogo />
          <h1 className="ta-auth-headline">Connexion Trackapp</h1>
          <p className="ta-auth-lead">Connecte-toi pour retrouver tes outils et ton espace.</p>

          <div className="ta-auth-oauth-stack">
            <button type="button" className="ta-auth-oauth-row" disabled={busy} onClick={() => oauth("google")}>
              <SvgGoogle />
              Continuer avec Google
            </button>
            <button type="button" className="ta-auth-oauth-row" disabled={busy} onClick={() => oauth("apple")}>
              <SvgApple />
              Continuer avec Apple
            </button>
            <button type="button" className="ta-auth-oauth-row" disabled={busy} onClick={() => oauth("azure")}>
              <SvgMicrosoft />
              Continuer avec Microsoft
            </button>
          </div>

          <div className="ta-auth-divider-or" aria-hidden>
            <span>ou</span>
          </div>

          <form className="ta-auth-fields w-full max-w-none" onSubmit={onSubmit}>
            <input
              className="ta-auth-input"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="ta-auth-input"
              name="password"
              type="password"
              placeholder="Mot de passe"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <p className="ta-auth-error">{error}</p> : null}
            <button type="submit" className="ta-auth-submit" disabled={disabled}>
              {busy ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="ta-auth-muted-link-row">
            <Link prefetch={false} href="/trackapp/mot-de-passe-oublie">
              Mot de passe oublié ?
            </Link>
            <span>
              Pas de compte ?{" "}
              <Link prefetch={false} href="/trackapp/inscription">
                S&apos;inscrire
              </Link>
            </span>
          </div>

          <div className="ta-auth-sso-note mt-12 border-t border-white/[0.06] pt-6">
            <SvgCloudSmall />
            <span>
              SSO équipes&nbsp;: <Link href="/trackapp/paiement">voir les offres</Link>.
            </span>
          </div>

          <TaAuthLegalFooter />
        </div>

        <PromoPanel active={slide} />
      </div>
    </div>
  );
}

export function TaConnexionFlow({ nextHref }: Readonly<{ nextHref: string }>) {
  return (
    <Suspense fallback={<TaAuthSuspended />}>
      <ConnexionExperienceInner nextHrefSafe={nextHref} />
    </Suspense>
  );
}
