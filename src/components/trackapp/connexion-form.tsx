"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function ConnexionForm({ nextHref }: { nextHref: string }) {
  const sb = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const disabled = useMemo(() => busy || !email || !password, [busy, email, password]);

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
    router.push(nextHref);
  }

  if (!sb) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-[14px] text-white/60">
        Définissez <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> pour activer l’auth Trackapp.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2 text-[13px] text-rose-200">{error}</p>
      ) : null}
      <div>
        <label htmlFor="em" className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-white/38">
          Email
        </label>
        <input
          id="em"
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
        <label htmlFor="pw" className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-white/38">
          Mot de passe
        </label>
        <input
          id="pw"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-[15px] text-white outline-none ring-violet-500/30 transition focus:border-violet-500/55 focus:ring"
        />
      </div>
      <button
        disabled={disabled}
        type="submit"
        className="ta-cta-purple w-full justify-center px-10 disabled:pointer-events-none disabled:opacity-50"
      >
        {busy ? "Connexion…" : "Continuer"}
      </button>
      <p className="text-center text-[13px] text-white/45">
        Mot de passe oublié ?{" "}
        <Link href="/trackapp/mot-de-passe-oublie" className="text-violet-300 underline underline-offset-4 hover:text-violet-200">
          Réinitialiser
        </Link>
      </p>
      <p className="text-center text-[13px] text-white/35">
        Pas de compte ?{" "}
        <Link href="/trackapp/inscription" className="text-white/72 hover:text-white hover:underline">
          Inscription
        </Link>
      </p>
    </form>
  );
}
