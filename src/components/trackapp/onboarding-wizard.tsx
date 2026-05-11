"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { TrackappOnboardingAnswers } from "@/lib/trackapp/playbook";

const SWATCH = ["#7c3aed", "#a855f7", "#8b5cf6", "#ec4899", "#6366f1"];

function OnboardingSuspenseFallback() {
  return <div className="text-white/42">Ouverture de l&apos;onboarding…</div>;
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
      <p className="text-[14px] text-white/50">
        Configurer NEXT_PUBLIC_SUPABASE_URL / ANON_KEY pour poursuivre l&apos;onboarding.
      </p>
    );
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <p className="text-[13px] text-white/45">{subtitle}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">
            Nom projet (fonctionnel)
          </label>
          <input
            required
            value={answers.app_name ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, app_name: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] outline-none ring-violet-500/35 focus:border-violet-400/65 focus:ring-2"
            placeholder="ex. FocusFlow Clone"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">Accent UI</label>
          <div className="flex flex-wrap gap-2">
            {SWATCH.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Couleur accent ${c}`}
                title={c}
                onClick={() => setAnswers((a) => ({ ...a, accent_color: c }))}
                className={`relative h-9 w-9 rounded-full shadow-inner ring-offset-4 ring-offset-black ${answers.accent_color === c ? "ring-2 ring-violet-300" : "ring ring-white/10"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">
            Audience cible — 1 ligne
          </label>
          <input
            required
            value={answers.audience ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, audience: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring"
            placeholder="ex. étudiants stressés en exam"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">
            Modèle économique
          </label>
          <select
            value={answers.business_model ?? "freemium"}
            onChange={(e) => setAnswers((a) => ({ ...a, business_model: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring"
          >
            <option value="freemium">Freemium</option>
            <option value="abonnement">Abonnement</option>
            <option value="achats_in_app">Achats In-App</option>
            <option value="pub">Ads</option>
            <option value="gratuite">Sans revenus (pour l&apos;instant)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">Ton de marque</label>
          <select
            value={answers.tone ?? "coach"}
            onChange={(e) => setAnswers((a) => ({ ...a, tone: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring"
          >
            <option value="minimal">Minimal techno</option>
            <option value="coach">Coach positif</option>
            <option value="luxe">Luxe aspiratif</option>
            <option value="fun">Joueur / fun</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">
            Niveau connaissance apps
          </label>
          <select
            value={answers.app_experience ?? "debutant"}
            onChange={(e) => setAnswers((a) => ({ ...a, app_experience: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring"
          >
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/36">
            Horizon temps / budget{" "}
            <span className="font-normal normal-case tracking-normal text-white/40">optionnel — 80 caractères</span>
          </label>
          <input
            maxLength={80}
            value={answers.horizon ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, horizon: e.target.value }))}
            placeholder="ex. POC 4 semaines / budget léger Ads"
            className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring"
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
