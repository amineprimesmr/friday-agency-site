"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { TrackappOnboardingAnswers } from "@/lib/trackapp/playbook";

const SWATCH = ["#7c3aed", "#a855f7", "#8b5cf6", "#ec4899", "#6366f1"];

function OnboardingSuspenseFallback() {
  return <div className="text-[14px] text-slate-400">Ouverture de l&apos;onboarding…</div>;
}

function OnboardingWizardInner({
  defaults,
}: {
  defaults?: {
    answers?: Partial<TrackappOnboardingAnswers> | undefined;
    sourceAppId?: string | null;
  };
}) {
  const sb = createClient();
  const router = useRouter();
  const qs = useSearchParams();
  const appFromQs = qs?.get("app") ?? "";
  const mode = qs?.get("mode") ?? "";

  const [answers, setAnswers] = useState<TrackappOnboardingAnswers>({
    ...defaults?.answers,
    app_name: defaults?.answers?.app_name ?? "",
    accent_color: defaults?.answers?.accent_color ?? SWATCH[0],
    audience: defaults?.answers?.audience ?? "",
    business_model: defaults?.answers?.business_model ?? "freemium",
    tone: defaults?.answers?.tone ?? "coach",
    app_experience: defaults?.answers?.app_experience ?? "debutant",
    horizon: defaults?.answers?.horizon ?? "",
  });

  const sourceAppId =
    defaults?.sourceAppId && defaults.sourceAppId.length > 0 ? defaults.sourceAppId : appFromQs ? appFromQs : null;

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (defaults?.answers) {
      setAnswers((a) => ({ ...a, ...defaults.answers }));
    }
  }, [defaults?.answers]);

  const subtitle = useMemo(() => {
    if (mode === "start" || !sourceAppId) return "Parcours court — aucune app importée depuis le Tracker.";
    return `App Tracker liée (${sourceAppId}) — données App Store utilisées uniquement comme contexte.`;
  }, [mode, sourceAppId]);

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!sb) return;
    const { data: userData } = await sb.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    setBusy(true);
    const body = {
      id: uid,
      onboarding: {
        ...answers,
        onboarding_version: "1",
      },
      ...(sourceAppId ? { source_app_store_id: sourceAppId } : {}),
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await sb.from("trackapp_profiles").upsert(body).select("id");

    await sb.auth.updateUser({
      data: { trackapp_ready: true },
    });

    setBusy(false);
    router.refresh();
    router.push("/trackapp/espace");
  }

  if (!sb) {
    return (
      <p className="text-[14px] text-slate-500">
        Configurer NEXT_PUBLIC_SUPABASE_URL / ANON_KEY pour poursuivre l&apos;onboarding.
      </p>
    );
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <p className="text-[13px] text-slate-500">{subtitle}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Nom projet (fonctionnel)
          </label>
          <input
            required
            value={answers.app_name ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, app_name: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none ring-blue-500/25 focus:border-blue-400 focus:ring-2"
            placeholder="ex. FocusFlow Clone"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Accent UI</label>
          <div className="flex flex-wrap gap-2">
            {SWATCH.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Couleur accent ${c}`}
                title={c}
                onClick={() => setAnswers((a) => ({ ...a, accent_color: c }))}
                className={`relative h-9 w-9 rounded-full shadow-inner ring-offset-2 ring-offset-white ${answers.accent_color === c ? "ring-2 ring-violet-500" : "ring ring-slate-200"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Audience cible — 1 ligne
          </label>
          <input
            required
            value={answers.audience ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, audience: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            placeholder="ex. étudiants stressés en exam"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Modèle économique
          </label>
          <select
            value={answers.business_model ?? "freemium"}
            onChange={(e) => setAnswers((a) => ({ ...a, business_model: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="freemium">Freemium</option>
            <option value="abonnement">Abonnement</option>
            <option value="achats_in_app">Achats In-App</option>
            <option value="pub">Ads</option>
            <option value="gratuite">Sans revenus (pour l&apos;instant)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ton de marque</label>
          <select
            value={answers.tone ?? "coach"}
            onChange={(e) => setAnswers((a) => ({ ...a, tone: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="minimal">Minimal techno</option>
            <option value="coach">Coach positif</option>
            <option value="luxe">Luxe aspiratif</option>
            <option value="fun">Joueur / fun</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Niveau connaissance apps
          </label>
          <select
            value={answers.app_experience ?? "debutant"}
            onChange={(e) => setAnswers((a) => ({ ...a, app_experience: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Horizon temps / budget{" "}
            <span className="font-normal normal-case tracking-normal text-slate-400">optionnel — 80 caractères</span>
          </label>
          <input
            maxLength={80}
            value={answers.horizon ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, horizon: e.target.value }))}
            placeholder="ex. POC 4 semaines / budget léger Ads"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button type="submit" disabled={busy} className="trackapp-btn-primary-dash px-10 disabled:pointer-events-none disabled:opacity-50">
          {busy ? "Sauvegarde…" : "Accéder à mon playbook"}
        </button>
        <Link href="/trackapp/espace" className="trackapp-btn-ghost-dash self-center">
          Retour dashboard
        </Link>
      </div>
    </form>
  );
}

export function OnboardingWizard({ defaults }: { defaults?: Parameters<typeof OnboardingWizardInner>[0]["defaults"] }) {
  return (
    <Suspense fallback={<OnboardingSuspenseFallback />}>
      <OnboardingWizardInner defaults={defaults} />
    </Suspense>
  );
}
