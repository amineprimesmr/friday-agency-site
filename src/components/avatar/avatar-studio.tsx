"use client";

import { useMemo, useState } from "react";
import { REFERENCE_ANGLE_ORDER, ReferenceAngle } from "@/lib/avatar-prompts";
import { PhotoUploader } from "./photo-uploader";
import { ReferenceSheet } from "./reference-sheet";
import { SceneGenerator } from "./scene-generator";
import { VideoAnimator } from "./video-animator";

interface PhotoData {
  masterPrompt: string;
  imageBase64: string;
  mimeType: string;
  referenceFileId: string;
}

const STEPS = [
  { id: 1, label: "Photo", sublabel: "Upload & analyse IA" },
  { id: 2, label: "Reference Sheet", sublabel: "5 angles 360°" },
  { id: 3, label: "Scènes", sublabel: "Génère les images" },
  { id: 4, label: "Vidéo", sublabel: "Anime avec Kling" },
];

export function AvatarStudio() {
  const [step, setStep] = useState(1);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [referenceImages, setReferenceImages] = useState<Partial<Record<ReferenceAngle, string>>>({});
  const [referenceImageFileIds, setReferenceImageFileIds] = useState<
    Partial<Record<ReferenceAngle, string>>
  >({});
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedScenePresetId, setSelectedScenePresetId] = useState<string | undefined>();

  const sceneReferenceFileIds = useMemo(() => {
    if (!photoData?.referenceFileId) return [];
    const ids = [photoData.referenceFileId];
    for (const a of REFERENCE_ANGLE_ORDER) {
      const fid = referenceImageFileIds[a];
      if (fid) ids.push(fid);
    }
    return ids;
  }, [photoData?.referenceFileId, referenceImageFileIds]);

  function handlePhotoReady(data: PhotoData) {
    setPhotoData(data);
    setReferenceImages({});
    setReferenceImageFileIds({});
    setStep(2);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400/80">
          Friday — AI Studio
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Avatar Generator
        </h1>
        <p className="mt-3 text-sm text-white/40">
          Upload une photo → analyse Claude → GPT Image 2 (éditions haute fidélité) → vidéo Kling.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() => step > s.id && setStep(s.id)}
              disabled={step <= s.id}
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
                <span className={`text-xs font-semibold ${step === s.id ? "text-white" : "text-white/40"}`}>
                  {s.label}
                </span>
                <span className="text-[10px] text-white/25">{s.sublabel}</span>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 transition sm:w-12 ${step > s.id ? "bg-white/30" : "bg-white/8"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-8">
        <div className="mb-6 border-b border-white/8 pb-5">
          <h2 className="text-lg font-bold text-white">
            Étape {step} — {STEPS[step - 1].label}
          </h2>
          <p className="mt-1 text-xs text-white/40">{STEPS[step - 1].sublabel}</p>
        </div>

        {step === 1 && <PhotoUploader onReady={handlePhotoReady} />}

        {step === 2 && photoData && (
          <ReferenceSheet
            masterPrompt={photoData.masterPrompt}
            referenceFileId={photoData.referenceFileId}
            referenceImageBase64={photoData.imageBase64}
            mimeType={photoData.mimeType}
            images={referenceImages}
            referenceImageFileIds={referenceImageFileIds}
            onImagesChange={setReferenceImages}
            onReferenceFileIdsChange={setReferenceImageFileIds}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && photoData && (
          <SceneGenerator
            masterPrompt={photoData.masterPrompt}
            sceneReferenceFileIds={sceneReferenceFileIds}
            onSelectScene={(url, presetId) => {
              setSelectedScene(url);
              setSelectedScenePresetId(presetId);
            }}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && selectedScene && (
          <VideoAnimator sceneImageUrl={selectedScene} scenePresetId={selectedScenePresetId} />
        )}

        {step === 4 && !selectedScene && (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-white/40">Aucune scène sélectionnée.</p>
            <button
              type="button"
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
