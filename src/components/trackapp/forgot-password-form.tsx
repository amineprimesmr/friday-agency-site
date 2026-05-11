"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const sb = createClient();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!sb || !email) return;
    setBusy(true);
    setMsg(null);
    const origin =
      typeof window !== "undefined" ?
        `${window.location.origin}/trackapp/connexion?reset=mot-de-passe`
      : "";

    await sb.auth.resetPasswordForEmail(email, { redirectTo: origin });

    setBusy(false);
    setMsg(
      origin ?
        `Si cet email existe dans Trackapp / Supabase, un lien sera envoyé. Redirection prévue après clic : connexion (${origin}).`
      : "Si compte existant → email envoyé.",
    );
  }

  if (!sb) {
    return (
      <p className="text-[14px] text-white/55">
        Configurer NEXT_PUBLIC_SUPABASE_URL / ANON KEY pour cette étape (flux standard Supabase).
      </p>
    );
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div>
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/38">
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          className="w-full rounded-xl border border-white/[0.1] bg-black/35 px-4 py-3 text-[15px] text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25"
        />
      </div>
      <button disabled={busy} type="submit" className="ta-cta-purple w-full justify-center disabled:opacity-50">
        Envoyer lien
      </button>
      {msg ? <p className="text-[13px] leading-relaxed text-violet-200/92">{msg}</p> : null}
    </form>
  );
}
