"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import type { ContentBriefPersisted } from "@/lib/avatar-content-brief";
import { buildScenePrompt, SCENE_PRESETS, ScenePreset } from "@/lib/avatar-prompts";
import { requestAvatarImageGeneration } from "@/lib/avatar-image-client";
import type { SceneDraftPersisted } from "@/lib/avatar-studio-persistence";

interface Props {
  masterPrompt: string;
  contentBrief: ContentBriefPersisted;
  sceneReferenceFileIds: string[];
  sceneDraft: SceneDraftPersisted;
  setSceneDraft: Dispatch<SetStateAction<SceneDraftPersisted>>;
  onSelectScene: (imageUrl: string, presetId?: string) => void;
  onNext: () => void;
}

const LIGHTING_OPTIONS = [
  "Golden hour warm sunlight",
  "Neon night city lights",
  "MacBook screen glow, dark room",
  "Studio three-point lighting",
  "Overcast natural light",
  "Candlelight, warm amber",
  "Blue hour twilight",
];

const SHOT_OPTIONS = [
  "Medium shot",
  "Close-up portrait",
  "Wide establishing shot",
  "Extreme close-up face",
  "Low angle medium shot",
  "Over-the-shoulder",
];

export function SceneGenerator({
  masterPrompt,
  contentBrief,
  sceneReferenceFileIds,
  sceneDraft,
  setSceneDraft,
  onSelectScene,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);

  const {
    selectedPresetId,
    customScene,
    lighting,
    shot,
    generatedImages,
    selectedImageUrl,
    showPrompt,
  } = sceneDraft;

  const selectedPreset = useMemo((): ScenePreset | null => {
    if (!selectedPresetId) return null;
    return SCENE_PRESETS.find((p) => p.id === selectedPresetId) ?? null;
  }, [selectedPresetId]);

  const scenePrompt = buildScenePrompt(
    masterPrompt,
    selectedPreset,
    customScene,
    lighting,
    shot,
    contentBrief,
  );

  async function generateSingleScene() {
    setLoading(true);
    setSceneDraft((d) => ({ ...d, generatedImages: [], selectedImageUrl: null }));
    try {
      const out = await requestAvatarImageGeneration(scenePrompt, sceneReferenceFileIds);
      const url = out.imageUrl;
      if (!url) throw new Error("Pas d'image dans la réponse");
      setSceneDraft((d) => ({
        ...d,
        generatedImages: [url],
        selectedImageUrl: url,
      }));
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAndNext(url: string) {
    setSceneDraft((d) => ({ ...d, selectedImageUrl: url }));
    onSelectScene(url, selectedPreset?.id);
    onNext();
  }

  const canGenerate = selectedPreset !== null || customScene.trim().length > 10;
  const generatedUrl = generatedImages[0];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-white/50">
        Une seule génération par clic — <strong className="text-white/60">édition GPT Image</strong> avec{" "}
        {sceneReferenceFileIds.length} fichier(s) référence. Le brief créateur du début oriente le cadrage et
        l&apos;ambiance (vertical social).
      </p>

      {/* Preset grid */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
          Scènes prêtes à l&apos;emploi
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SCENE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setSceneDraft((d) => ({ ...d, selectedPresetId: preset.id, customScene: "" }));
              }}
              className={`rounded-xl border p-3 text-left transition ${
                selectedPreset?.id === preset.id
                  ? "border-violet-500/60 bg-violet-600/20 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <div className="mb-1 text-xl">{preset.emoji}</div>
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="mt-1 line-clamp-2 text-xs text-white/40">
                {preset.description.slice(0, 60)}…
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSceneDraft((d) => ({ ...d, selectedPresetId: null }))}
            className={`rounded-xl border p-3 text-left transition ${
              selectedPreset === null
                ? "border-violet-500/60 bg-violet-600/20 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/8"
            }`}
          >
            <div className="mb-1 text-xl">✍️</div>
            <div className="text-xs font-semibold">Scène personnalisée</div>
            <div className="mt-1 text-xs text-white/40">Décris ta propre scène</div>
          </button>
        </div>
      </div>

      {/* Custom scene input */}
      {!selectedPreset && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
            Décris la scène
          </h3>
          <textarea
            value={customScene}
            onChange={(e) => setSceneDraft((d) => ({ ...d, customScene: e.target.value }))}
            rows={3}
            placeholder="Ex: sitting at a poker table in a Vegas casino, surrounded by chips, confident expression, dramatic overhead light…"
            className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Lumière</label>
              <select
                value={lighting}
                onChange={(e) => setSceneDraft((d) => ({ ...d, lighting: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60"
              >
                {LIGHTING_OPTIONS.map((l) => (
                  <option key={l} value={l} className="bg-neutral-900">
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Cadrage</label>
              <select
                value={shot}
                onChange={(e) => setSceneDraft((d) => ({ ...d, shot: e.target.value }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60"
              >
                {SHOT_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Prompt preview */}
      <div className="rounded-xl border border-white/8 bg-white/3">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setSceneDraft((d) => ({ ...d, showPrompt: !d.showPrompt }))}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Prompt de scène</span>
          <span className="text-xs text-white/30">{showPrompt ? "Masquer ▲" : "Voir ▼"}</span>
        </button>
        {showPrompt && (
          <div className="border-t border-white/8 px-4 pb-4 pt-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/60">
              {scenePrompt}
            </pre>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={generateSingleScene}
        disabled={!canGenerate || loading}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {loading
          ? "Génération en cours (async, quelques minutes possibles)…"
          : generatedUrl
            ? "Régénérer une nouvelle image (1 appel)"
            : "Générer l’image de scène (1 appel)"}
      </button>

      {generatedUrl ? (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
            Résultat
          </h3>
          <div
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition ${
              selectedImageUrl === generatedUrl ? "border-violet-500" : "border-white/10"
            }`}
            onClick={() => setSceneDraft((d) => ({ ...d, selectedImageUrl: generatedUrl }))}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={generatedUrl} alt="Scène générée" className="w-full object-cover" />
            {selectedImageUrl === generatedUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-violet-600/20">
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                  Prête pour la vidéo ✓
                </span>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => handleSelectAndNext(generatedUrl)}
            className="rounded-lg bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Animer cette scène →
          </button>
        </div>
      ) : null}
    </div>
  );
}
