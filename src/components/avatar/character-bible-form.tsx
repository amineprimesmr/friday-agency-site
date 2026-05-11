"use client";

import { CharacterBible, BIBLE_DEFAULTS, buildMasterPrompt } from "@/lib/avatar-prompts";
import { useState } from "react";

interface Props {
  bible: CharacterBible;
  onChange: (b: CharacterBible) => void;
  onNext: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 focus:bg-white/8 transition-colors"
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export function CharacterBibleForm({ bible, onChange, onNext }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);

  function set<K extends keyof CharacterBible>(key: K, val: CharacterBible[K]) {
    onChange({ ...bible, [key]: val });
  }

  const masterPrompt = buildMasterPrompt(bible);

  return (
    <div className="flex flex-col gap-8">
      {/* Reset */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          Décris ton personnage. Plus c&apos;est précis, plus le résultat est consistant.
        </p>
        <button
          onClick={() => onChange(BIBLE_DEFAULTS)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Réinitialiser exemple
        </button>
      </div>

      <Section title="Identité">
        <Field label="Âge" value={bible.age} onChange={(v) => set("age", v)} placeholder="24" />
        <Field label="Genre" value={bible.gender} onChange={(v) => set("gender", v)} placeholder="man / woman" />
        <Field label="Origine" value={bible.ethnicity} onChange={(v) => set("ethnicity", v)} placeholder="Black, Asian, Latino…" />
      </Section>

      <Section title="Peau">
        <Field label="Teinte" value={bible.skinTone} onChange={(v) => set("skinTone", v)} placeholder="medium-dark warm brown" />
        <Field label="Texture" value={bible.skinTexture} onChange={(v) => set("skinTexture", v)} placeholder="smooth clear complexion" />
      </Section>

      <Section title="Visage">
        <Field label="Forme" value={bible.faceShape} onChange={(v) => set("faceShape", v)} placeholder="oval / square" />
        <Field label="Mâchoire" value={bible.jawline} onChange={(v) => set("jawline", v)} placeholder="sharp / soft" />
        <Field label="Pommettes" value={bible.cheekbones} onChange={(v) => set("cheekbones", v)} placeholder="high prominent" />
        <Field label="Menton" value={bible.chin} onChange={(v) => set("chin", v)} placeholder="strong / rounded" />
      </Section>

      <Section title="Yeux & Sourcils">
        <Field label="Couleur yeux" value={bible.eyeColor} onChange={(v) => set("eyeColor", v)} placeholder="dark brown" />
        <Field label="Forme yeux" value={bible.eyeShape} onChange={(v) => set("eyeShape", v)} placeholder="almond-shaped" />
        <Field label="Sourcils" value={bible.eyebrows} onChange={(v) => set("eyebrows", v)} placeholder="thick well-groomed" />
      </Section>

      <Section title="Lèvres & Expression">
        <Field label="Lèvres" value={bible.lips} onChange={(v) => set("lips", v)} placeholder="full / thin" />
        <Field label="Expression" value={bible.expression} onChange={(v) => set("expression", v)} placeholder="confident neutral" />
      </Section>

      <Section title="Cheveux">
        <Field label="Style" value={bible.hairStyle} onChange={(v) => set("hairStyle", v)} placeholder="short tight 4C coily hair" />
        <Field label="Couleur" value={bible.hairColor} onChange={(v) => set("hairColor", v)} placeholder="natural black" />
        <Field label="Texture" value={bible.hairTexture} onChange={(v) => set("hairTexture", v)} placeholder="4C coily tight curls" />
        <Field label="Dégradé" value={bible.fadeStyle} onChange={(v) => set("fadeStyle", v)} placeholder="clean low fade on sides" />
      </Section>

      <Section title="Pilosité faciale">
        <div className="col-span-3">
          <Field
            label="Barbe / Moustache"
            value={bible.facialHair}
            onChange={(v) => set("facialHair", v)}
            placeholder="very light sparse stubble on chin and upper lip"
          />
        </div>
      </Section>

      <Section title="Accessoires">
        <Field label="Lunettes" value={bible.glasses} onChange={(v) => set("glasses", v)} placeholder="thick square matte black acetate" />
        <Field label="Boucles d'oreille" value={bible.earrings} onChange={(v) => set("earrings", v)} placeholder="small diamond stud left ear" />
        <Field label="Collier" value={bible.necklace} onChange={(v) => set("necklace", v)} placeholder="thin silver chain" />
      </Section>

      <Section title="Tenue">
        <Field label="Haut" value={bible.top} onChange={(v) => set("top", v)} placeholder="off-white bouclé oversized sweater" />
        <Field label="Bas" value={bible.bottom} onChange={(v) => set("bottom", v)} placeholder="light blue baggy jeans" />
        <Field label="Chaussures" value={bible.shoes} onChange={(v) => set("shoes", v)} placeholder="white leather sneakers" />
      </Section>

      <Section title="Physique">
        <Field label="Morphologie" value={bible.build} onChange={(v) => set("build", v)} placeholder="lean athletic" />
        <Field label="Posture" value={bible.posture} onChange={(v) => set("posture", v)} placeholder="confident upright" />
      </Section>

      {/* Live prompt preview */}
      <div className="rounded-xl border border-white/8 bg-white/3">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setShowPrompt(!showPrompt)}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Prompt maître généré
          </span>
          <span className="text-xs text-white/30">{showPrompt ? "Masquer ▲" : "Voir ▼"}</span>
        </button>
        {showPrompt && (
          <div className="border-t border-white/8 px-4 pb-4 pt-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/60">
              {masterPrompt}
            </pre>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 active:scale-[0.98]"
      >
        Générer la Reference Sheet 360° →
      </button>
    </div>
  );
}
