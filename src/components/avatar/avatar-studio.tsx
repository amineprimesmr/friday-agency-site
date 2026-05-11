"use client";

import { useState } from "react";
import { CharacterBible, BIBLE_DEFAULTS, ReferenceAngle } from "@/lib/avatar-prompts";
import { CharacterBibleForm } from "./character-bible-form";
import { ReferenceSheet } from "./reference-sheet";
import { SceneGenerator } from "./scene-generator";
import { VideoAnimator } from "./video-animator";

const STEPS = [
  { id: 1, label: "Character Bible", sublabel: "Décris le personnage" },
  { id: 2, label: "Reference Sheet", sublabel: "5 angles 360°" },
  { id: 3, label: "Scènes", sublabel: "Génère les images" },
  { id: 4, label: "Vidéo", sublabel: "Anime avec Kling" },
];

export function AvatarStudio() {
  const [step, setStep] = useState(1);
  const [bible, setBible] = useState<CharacterBible>(BIBLE_DEFAULTS);
  const [referenceImages, setReferenceImages] = useState<
    Partial<Record<ReferenceAngle, string>>
  >({});
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedScenePresetId, setSelectedScenePresetId] = useState<string | undefined>();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400/80">
          Friday — AI Studio
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Avatar Generator
        </h1>
        <p className="mt-3 text-sm text-white/40">
          Crée un avatar ultra-réaliste et anime-le en vidéo — en 4 étapes.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
                step > s.id ? "cursor-pointer opacity-60 hover:opacity-100" : "cursor-default"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  step === s.id
                    ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                    : step > s.id
                      ? "border-white/30 bg-white/10 text-white/60"
                      : "border-white/10 bg-white/5 text-white/20"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <div className="hidden flex-col items-center sm:flex">
                <span
                  className={`text-xs font-semibold ${
                    step === s.id ? "text-white" : "text-white/40"
                  }`}
                >
                  {s.label}
                </span>
                <span className="text-[10px] text-white/25">{s.sublabel}</span>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 transition sm:w-12 ${
                  step > s.id ? "bg-white/30" : "bg-white/8"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-8">
        <div className="mb-6 border-b border-white/8 pb-5">
          <h2 className="text-lg font-bold text-white">
            Étape {step} — {STEPS[step - 1].label}
          </h2>
          <p className="mt-1 text-xs text-white/40">{STEPS[step - 1].sublabel}</p>
        </div>

        {step === 1 && (
          <CharacterBibleForm
            bible={bible}
            onChange={setBible}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <ReferenceSheet
            bible={bible}
            images={referenceImages}
            onImagesChange={setReferenceImages}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <SceneGenerator
            bible={bible}
            referenceImageUrl={referenceImages.three_quarters ?? referenceImages.front}
            onSelectScene={(url, presetId) => {
              setSelectedScene(url);
              setSelectedScenePresetId(presetId);
            }}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && selectedScene && (
          <VideoAnimator
            sceneImageUrl={selectedScene}
            scenePresetId={selectedScenePresetId}
          />
        )}

        {step === 4 && !selectedScene && (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-white/40">Aucune scène sélectionnée.</p>
            <button
              onClick={() => setStep(3)}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              ← Retour aux scènes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
