"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import {
  PROMO_SLIDES,
  PromoPanel,
  SvgCloudSmall,
  SvgGoogle,
  SvgMail,
  SvgApple,
  TaAuthLegalFooter,
  TaAuthSuspended,
  TrackappLimeLogo,
} from "@/components/trackapp/auth/trackapp-auth-shared";
import { createClient } from "@/lib/supabase/client";
import { TRACKAPP_WORKSPACE_HUB_PATH } from "@/lib/trackapp-apptracker-paths";

function buildSignupExtrasQs(mode: string, appId: string, ref: string): string {
  const p = new URLSearchParams();
  if (mode) p.set("mode", mode);
  if (appId) p.set("app", appId);
  if (ref) p.set("ref", ref);
  const s = p.toString();
  return s ? `?${s}` : "";
}

function InscriptionExperienceInner({
  promoImageSrc,
}: Readonly<{ promoImageSrc?: string | null }>) {
  const sb = createClient();
  const router = useRouter();
  const sp = useSearchParams();
  const mode = sp?.get("mode") ?? "";
  const appId = sp?.get("app") ?? "";
  const ref = sp?.get("ref")?.trim() ?? "";

  const [gate, setGate] = useState<"pick" | "email">("pick");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [slide, setSlide] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % PROMO_SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const signupExtrasQs = useMemo(() => buildSignupExtrasQs(mode, appId, ref), [mode, appId, ref]);
  const nextAfterAuth = `${TRACKAPP_WORKSPACE_HUB_PATH}${signupExtrasQs}`;
  const callbackUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ?
        window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "");
    const nextEnc = encodeURIComponent(nextAfterAuth);
    return `${origin}/trackapp/auth/callback?next=${nextEnc}`;
  }, [nextAfterAuth]);

  const disabled = busy || email.length < 3 || password.length < 8;

  const oauth = useCallback(
    async (provider: "google" | "apple") => {
      if (!sb) return;
      setBusy(true);
      setError(null);
      const { error: oErr } = await sb.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
          queryParams:
            provider === "google" ? { prompt: "select_account" }
            : provider === "apple" ?
              {}
            : {},
        },
      });
      setBusy(false);
      if (oErr) setError(oErr.message ?? `Connexion ${provider} indisponible (vérifie le fournisseur dans Supabase).`);
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
    const origin =
      typeof window !== "undefined" ?
        window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    const { data: authData, error: signupErr } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin ?? ""}${nextAfterAuth}`,
        data: appId ? { source_app_store_id: appId } : undefined,
      },
    });
    setBusy(false);
    if (signupErr) {
      setError(signupErr.message ?? "Erreur à l'inscription.");
      return;
    }
    if (authData.session) {
      await fetch("/api/trackapp/affiliate/attach", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ref ? { referralCode: ref } : {}),
      }).catch(() => {});
      router.refresh();
      router.push(nextAfterAuth);
      return;
    }
    setError(
      "Consultez votre boîte mail pour confirmer le compte puis reconnectez-vous. Si la confirmation mail est désactivée en dev, vérifiez le projet Supabase.",
    );
    router.refresh();
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

  return (
    <div className="ta-auth-root ta-font">
      <div className="ta-auth-modal relative">
        <Link href={closeHref} className="ta-auth-close" prefetch={false} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>

        <div className={`ta-auth-pane${gate === "email" ? " ta-auth-pane--with-back" : ""}`}>
          {gate === "email" ?
            <button type="button" className="ta-auth-back" onClick={() => setGate("pick")} aria-label="Retour">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m15 6-9 9 9 9" />
              </svg>
            </button>
          : null}

          <TrackappLimeLogo />

          {gate === "pick" ?
            <>
              <h1 className="ta-auth-headline">Bienvenue sur Trackapp</h1>
              <p className="ta-auth-lead">Inscrivez-vous gratuitement pour accéder aux outils Trackapp.</p>

              <div className="ta-auth-oauth-stack">
                <button type="button" className="ta-auth-oauth-row" disabled={busy} onClick={() => oauth("google")}>
                  <SvgGoogle />
                  Continuer avec Google
                </button>
                <button type="button" className="ta-auth-oauth-row" disabled={busy} onClick={() => oauth("apple")}>
                  <SvgApple />
                  Continuer avec Apple
                </button>
              </div>

              <div className="ta-auth-divider-or" aria-hidden>
                <span>ou</span>
              </div>
              <div className="ta-auth-oauth-stack">
                <button
                  type="button"
                  className="ta-auth-oauth-row"
                  disabled={busy}
                  onClick={() => {
                    setGate("email");
                    setError(null);
                  }}
                >
                  <SvgMail />
                  Continuer avec l&apos;e-mail
                </button>
              </div>

              <div className="ta-auth-sso-note">
                <SvgCloudSmall />
                <span>
                  SSO équipes&nbsp;:{" "}
                  <Link href="/trackapp/paiement">voir les offres</Link>.
                </span>
              </div>
              {error && gate === "pick" ? <p className="ta-auth-error">{error}</p> : null}
            </>
          : <>
              <h1 className="ta-auth-headline">Créer un compte</h1>
              <p className="ta-auth-lead">Inscrivez-vous gratuitement pour accéder aux outils Trackapp.</p>

              <form className="ta-auth-fields w-full max-w-none" onSubmit={onSubmit}>
                {appId ?
                  <p className="mb-3 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white/70">
                    Copie depuis l&apos;App Store&nbsp;:{" "}
                    <strong className="text-white">{appId}</strong>
                  </p>
                : null}
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
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error ? <p className="ta-auth-error">{error}</p> : null}
                <button className="ta-auth-submit" type="submit" disabled={disabled}>
                  {busy ? "Création…" : "Continuer avec l'e-mail"}
                </button>
              </form>

              <p className="ta-auth-muted-link">
                Vous avez déjà un compte ?{" "}
                <Link prefetch={false} href={`/trackapp/connexion?next=${encodeURIComponent(`${TRACKAPP_WORKSPACE_HUB_PATH}${signupExtrasQs}`)}`}>
                  Se connecter
                </Link>
              </p>
            </>
          }

          <TaAuthLegalFooter />
        </div>

        <PromoPanel active={slide} promoImageSrc={promoImageSrc} />
      </div>
    </div>
  );
}

export function TaInscriptionFlow({
  promoImageSrc,
}: Readonly<{ promoImageSrc?: string | null }>) {
  return (
    <Suspense fallback={<TaAuthSuspended />}>
      <InscriptionExperienceInner promoImageSrc={promoImageSrc ?? null} />
    </Suspense>
  );
}
