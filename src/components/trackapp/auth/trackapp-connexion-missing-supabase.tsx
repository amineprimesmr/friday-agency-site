"use client";

import Link from "next/link";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";
import { TRACKAPP_APPTRACKER_PATH } from "@/lib/trackapp-tools-paths";

export function TrackappConnexionMissingSupabase({
  embedded = false,
}: Readonly<{
  embedded?: boolean;
}>) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className={embedded ? "ta-auth-root ta-auth-root--embedded" : "ta-auth-root"}>
      <div className="ta-auth-modal relative p-8 sm:p-10">
        <h1 className="m-0 text-lg font-bold text-white">Configuration locale requise</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/60">
          Les clés Supabase dans <code className="text-white/85">.env.local</code> sont vides ou invalides.
          Sans elles, la connexion (email / Google) ne peut pas fonctionner.
        </p>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-white/55">
          <li>
            Dashboard Supabase → <strong className="text-white/80">Settings → API</strong>
          </li>
          <li>
            Colle <code className="text-white/85">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code className="text-white/85">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
          <li>
            Auth → URL Configuration : ajoute{" "}
            <code className="text-white/85">http://127.0.0.1:3000/trackapp/auth/callback</code>
          </li>
          <li>
            Terminal : <code className="text-white/85">npm run setup:local</code> puis{" "}
            <code className="text-white/85">npm run dev:reset</code>
          </li>
        </ol>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Link
            href={TRACKAPP_LANDING_PATH}
            className="inline-flex justify-center rounded-xl bg-[#d4ff22] px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide text-[#0a0c0e]"
          >
            Retour à AppLAB
          </Link>
          {isDev ? (
            <Link
              href={TRACKAPP_APPTRACKER_PATH}
              className="inline-flex justify-center rounded-xl border border-violet-500/45 bg-violet-600/25 px-5 py-2.5 text-[13px] font-semibold text-white"
            >
              Explorer le SaaS (dev, sans login)
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
