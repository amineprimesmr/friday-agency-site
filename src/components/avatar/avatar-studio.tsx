"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ReferenceAngle } from "@/lib/avatar-prompts";
import {
  clearAvatarStudioSnapshot,
  createDefaultSceneDraft,
  loadAvatarStudioSnapshot,
  saveAvatarStudioSnapshot,
  type AvatarStudioSnapshotV1,
  type PhotoDataPersisted,
  type SceneDraftPersisted,
} from "@/lib/avatar-studio-persistence";
import { PhotoUploader } from "./photo-uploader";
import { ReferenceSheet } from "./reference-sheet";
import { SceneGenerator } from "./scene-generator";
import { VideoAnimator } from "./video-animator";

/** Prefer face-rich angles; cap count to keep OpenAI edits faster (still 1 original + 3 views). */
const SCENE_REFERENCE_PRIORITY: ReferenceAngle[] = [
  "front",
  "close_up",
  "three_quarters",
  "left_profile",
  "back",
];
const MAX_SCENE_REFERENCE_FILES = 4;

const STEPS = [
  { id: 1, label: "Photo", sublabel: "Upload & analyse IA" },
  { id: 2, label: "Reference Sheet", sublabel: "5 angles 360°" },
  { id: 3, label: "Scènes", sublabel: "Génère les images" },
  { id: 4, label: "Vidéo", sublabel: "Anime avec Kling" },
];

const SAVE_DEBOUNCE_MS = 450;

export function AvatarStudio() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [photoData, setPhotoData] = useState<PhotoDataPersisted | null>(null);
  const [referenceImages, setReferenceImages] = useState<Partial<Record<ReferenceAngle, string>>>({});
  const [referenceImageFileIds, setReferenceImageFileIds] = useState<
    Partial<Record<ReferenceAngle, string>>
  >({});
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedScenePresetId, setSelectedScenePresetId] = useState<string | undefined>();
  const [sceneDraft, setSceneDraft] = useState<SceneDraftPersisted>(createDefaultSceneDraft);

  const sceneReferenceFileIds = useMemo(() => {
    if (!photoData?.referenceFileId) return [];
    const ids = [photoData.referenceFileId];
    for (const a of SCENE_REFERENCE_PRIORITY) {
      if (ids.length >= MAX_SCENE_REFERENCE_FILES) break;
      const fid = referenceImageFileIds[a];
      if (fid) ids.push(fid);
    }
    return ids;
  }, [photoData?.referenceFileId, referenceImageFileIds]);

  const mergeReferenceImages = useCallback((patch: Partial<Record<ReferenceAngle, string>>) => {
    setReferenceImages((prev) => ({ ...prev, ...patch }));
  }, []);

  const mergeReferenceFileIds = useCallback((patch: Partial<Record<ReferenceAngle, string>>) => {
    setReferenceImageFileIds((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const snap = await loadAvatarStudioSnapshot();
      if (cancelled) return;
      if (snap) {
        setStep(snap.step);
        setPhotoData(snap.photoData);
        setReferenceImages(snap.referenceImages);
        setReferenceImageFileIds(snap.referenceImageFileIds);
        setSelectedScene(snap.selectedScene);
        setSelectedScenePresetId(snap.selectedScenePresetId);
        setSceneDraft(snap.sceneDraft);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const payload: AvatarStudioSnapshotV1 = {
        version: 1,
        step,
        photoData,
        referenceImages,
        referenceImageFileIds,
        selectedScene,
        selectedScenePresetId,
        sceneDraft,
        savedAt: Date.now(),
      };
      void saveAvatarStudioSnapshot(payload);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [
    hydrated,
    step,
    photoData,
    referenceImages,
    referenceImageFileIds,
    selectedScene,
    selectedScenePresetId,
    sceneDraft,
  ]);

  function handlePhotoReady(data: PhotoDataPersisted) {
    setPhotoData(data);
    setReferenceImages({});
    setReferenceImageFileIds({});
    setSceneDraft(createDefaultSceneDraft());
    setSelectedScene(null);
    setSelectedScenePresetId(undefined);
    setStep(2);
  }

  async function handleNewSession() {
    await clearAvatarStudioSnapshot();
    setStep(1);
    setPhotoData(null);
    setReferenceImages({});
    setReferenceImageFileIds({});
    setSelectedScene(null);
    setSelectedScenePresetId(undefined);
    setSceneDraft(createDefaultSceneDraft());
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
          Upload → analyse → génération image en <strong className="text-white/55">file async</strong> (Upstash + OpenAI) → vidéo Kling.
        </p>
        <p className="mt-2 text-[11px] text-white/30">
          Ta progression et les images sont enregistrées dans ce navigateur (IndexedDB). Un bouton « Nouvelle session » efface tout.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => void handleNewSession()}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/55 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200/90"
        >
          Nouvelle session
        </button>
      </div>

      {!hydrated ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center text-sm text-white/40">
          Chargement de la session…
        </div>
      ) : (
        <>
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

            {step === 1 && (
              <PhotoUploader onReady={handlePhotoReady} restoredSession={photoData} />
            )}

            {step === 2 && photoData && (
              <ReferenceSheet
                masterPrompt={photoData.masterPrompt}
                referenceFileId={photoData.referenceFileId}
                referenceImageBase64={photoData.imageBase64}
                mimeType={photoData.mimeType}
                images={referenceImages}
                referenceImageFileIds={referenceImageFileIds}
                onMergeImages={mergeReferenceImages}
                onMergeFileIds={mergeReferenceFileIds}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && photoData && (
              <SceneGenerator
                masterPrompt={photoData.masterPrompt}
                sceneReferenceFileIds={sceneReferenceFileIds}
                sceneDraft={sceneDraft}
                setSceneDraft={setSceneDraft}
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
                customSceneDescription={
                  selectedScenePresetId ? undefined : sceneDraft.customScene?.trim() || undefined
                }
              />
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
        </>
      )}
    </div>
  );
}
