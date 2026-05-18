"use client";

import {
  createDefaultContentBrief,
  isContentBriefComplete,
  type ContentBriefPersisted,
} from "@/lib/avatar-content-brief";

interface Props {
  brief: ContentBriefPersisted;
  onChange: (b: ContentBriefPersisted) => void;
  onNext: () => void;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] leading-relaxed text-white/35">{hint}</p> : null}
    </div>
  );
}

export function ContentBriefForm({ brief, onChange, onNext }: Props) {
  function set<K extends keyof ContentBriefPersisted>(key: K, val: ContentBriefPersisted[K]) {
    onChange({ ...brief, [key]: val });
  }

  const platformsOk =
    brief.platforms.tiktok || brief.platforms.reels || brief.platforms.shorts;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 px-4 py-3">
        <p className="text-sm text-white/75 leading-relaxed">
          On construit d’abord <strong className="text-white/90">ton univers éditorial</strong> pour que
          chaque scène et chaque image collent à ton sujet (TikTok / Reels / Shorts) — avant même la photo
          de référence.
        </p>
      </div>

      <Field
        label="Qui es-tu face caméra ?"
        hint="Ex. : Chef d’entreprise 40 ans, 4 restaurants, en train de monter une franchise, je documente l’ouverture des nouveaux spots…"
      >
        <textarea
          value={brief.personaRole}
          onChange={(e) => set("personaRole", e.target.value)}
          rows={3}
          placeholder="Ton rôle, ton âge approximatif, ce que tu fais et ce que tu racontes…"
          className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <Field
        label="Sujet & niche"
        hint="Le fil rouge de tes vidéos : restauration, SaaS, fitness, immo…"
      >
        <textarea
          value={brief.nicheTopic}
          onChange={(e) => set("nicheTopic", e.target.value)}
          rows={2}
          placeholder="Ex. : franchise restauration, recrutement en cuisine, chiffres d’un nouveau lieu…"
          className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <Field
        label="Crédibilité (optionnel)"
        hint="Éléments que le public doit « sentir » sans forcément les afficher en gros : années d’expérience, nombre de clients, preuves sociales…"
      >
        <textarea
          value={brief.credibilityNotes}
          onChange={(e) => set("credibilityNotes", e.target.value)}
          rows={2}
          placeholder="Ex. : 15 ans dans la restauration, 4 adresses, équipe de 35 personnes…"
          className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <Field label="Ton & énergie">
        <input
          type="text"
          value={brief.tone}
          onChange={(e) => set("tone", e.target.value)}
          placeholder="Ex. : direct, expert calme, storytelling, punchy mais pro…"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <Field
        label="Plateformes cibles"
        hint="On exclut LinkedIn d’ici — uniquement le vertical court."
      >
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["tiktok", "TikTok"] as const,
              ["reels", "Instagram Reels"] as const,
              ["shorts", "YouTube Shorts"] as const,
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 transition hover:border-white/20"
            >
              <input
                type="checkbox"
                checked={brief.platforms[key]}
                onChange={(e) =>
                  set("platforms", { ...brief.platforms, [key]: e.target.checked })
                }
                className="rounded border-white/30 bg-white/10 text-violet-600"
              />
              {label}
            </label>
          ))}
        </div>
        {!platformsOk ? (
          <p className="text-xs text-amber-400/90">Choisis au moins une plateforme.</p>
        ) : null}
      </Field>

      <Field
        label="Inspiration (comptes, styles)"
        hint="Idéal : colle des @ ou des liens + décris ce que tu veux en reprendre (rythme, types de plans, accroches). Tu peux aussi joindre une capture d’écran plus tard dans ton workflow produit — ici le texte suffit pour orienter le prompt."
      >
        <textarea
          value={brief.inspirationAccounts}
          onChange={(e) => set("inspirationAccounts", e.target.value)}
          rows={3}
          placeholder="@exemple_restaurateur — hooks « erreur que je vois partout », face cam dans la cuisine, sous-titres dynamiques…"
          className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <Field
        label="Piliers de contenu (optionnel)"
        hint="Thèmes que tu veux souvent traiter : ça aide à choisir des scènes cohérentes."
      >
        <textarea
          value={brief.contentPillars}
          onChange={(e) => set("contentPillars", e.target.value)}
          rows={2}
          placeholder="Ex. : coulisses d’ouverture, recrutement, erreurs à éviter, chiffres en transparence…"
          className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <Field label="À éviter (optionnel)">
        <textarea
          value={brief.topicsToAvoid}
          onChange={(e) => set("topicsToAvoid", e.target.value)}
          rows={2}
          placeholder="Ex. : pas de politique, pas de noms de concurrents, pas d’alcool en avant-plan…"
          className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => onChange(createDefaultContentBrief())}
          className="text-xs text-white/30 hover:text-white/55 transition-colors"
        >
          Effacer le formulaire
        </button>
        <button
          type="button"
          disabled={!isContentBriefComplete(brief) || !platformsOk}
          onClick={onNext}
          className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuer vers la photo de référence →
        </button>
      </div>
    </div>
  );
}
