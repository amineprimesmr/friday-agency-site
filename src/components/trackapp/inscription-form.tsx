"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SuspendInscription() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-[14px] text-white/50">
      Chargement du formulaire…
    </div>
  );
}

function buildOnboardingQs(mode: string, appId: string): string {
  const p = new URLSearchParams();
  if (mode) p.set("mode", mode);
  if (appId) p.set("app", appId);
  const s = p.toString();
  return s ? `?${s}` : "";
}

function InscriptionInner() {
  const sb = createClient();
  const router = useRouter();
  const sp = useSearchParams();
  const mode = sp?.get("mode") ?? "";
  const appId = sp?.get("app") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onboardingQs = useMemo(() => buildOnboardingQs(mode, appId), [mode, appId]);

  const disabled = busy || email.length < 3 || password.length < 8;

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!sb) {
      setError("Configurer Supabase (NEXT_PUBLIC_SUPABASE_URL / ANON).");
      return;
    }
    setBusy(true);
    setError(null);
    const origin =
      typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    const { data: authData, error: signupErr } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin ?? ""}/trackapp/onboarding${onboardingQs}`,
        data:
          appId ?
            {
              source_app_store_id: appId,
            }
          : undefined,
      },
    });
    setBusy(false);

    if (signupErr) {
      setError(signupErr.message ?? "Erreur à l'inscription.");
      return;
    }

    if (authData.session) {
      router.refresh();
      router.push(`/trackapp/onboarding${onboardingQs}`);
      return;
    }

    setError(
      "Consulte ta boîte mail pour confirmer le compte, puis reconnecte-toi avec le lien reçu. Si la confirmation mail est désactivée en dev, passe par connexion après vérif projet Supabase.",
    );
    router.refresh();
  }

  if (!sb) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-[14px] text-white/60">
        Définissez <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
      </div>
    );
  }

  return (
    <div className="rounded-[1.85rem] border border-white/[0.08] bg-white/[0.03] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:p-10">
      <form onSubmit={onSubmit} className="space-y-5">
        {appId ?
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-4 py-3 text-[13px] text-white/82">
            App copiée (App Store ID) : <strong className="text-white">{appId}</strong>
          </div>
        : null}

        <div>
          <label htmlFor="e" className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-white/38">
            Email
          </label>
          <input
            id="e"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-[15px] text-white outline-none ring-violet-500/30 transition focus:border-violet-500/55 focus:ring"
          />
        </div>
        <div>
          <label htmlFor="p" className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-white/38">
            Mot de passe <span className="font-normal lowercase text-white/35">— min 8 caractères</span>
          </label>
          <input
            id="p"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-[15px] text-white outline-none ring-violet-500/30 transition focus:border-violet-500/55 focus:ring"
          />
        </div>

        {error ?
          <p className="rounded-xl border border-amber-500/28 bg-amber-500/[0.1] px-4 py-2 text-[13px] text-amber-100">{error}</p>
        : null}

        <button
          disabled={disabled}
          type="submit"
          className="ta-cta-purple w-full justify-center px-10 disabled:pointer-events-none disabled:opacity-50"
        >
          {busy ? "Création…" : "Créer mon compte Trackapp"}
        </button>

        <p className="text-center text-[13px] text-white/40">
          Tu as déjà un compte ?{" "}
          <Link href="/trackapp/connexion" className="text-white/75 underline-offset-4 hover:text-white hover:underline">
            Connexion
          </Link>
        </p>
      </form>
    </div>
  );
}

export function InscriptionFormWrapper() {
  return (
    <Suspense fallback={<SuspendInscription />}>
      <InscriptionInner />
    </Suspense>
  );
}
