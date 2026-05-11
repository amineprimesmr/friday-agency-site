"use client";

import { useState } from "react";
import { buildScenePrompt, SCENE_PRESETS, ScenePreset } from "@/lib/avatar-prompts";
import { readApiJson } from "@/lib/read-api-json";

interface Props {
  masterPrompt: string;
  sceneReferenceFileIds: string[];
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
  sceneReferenceFileIds,
  onSelectScene,
  onNext,
}: Props) {
  const [selectedPreset, setSelectedPreset] = useState<ScenePreset | null>(null);
  const [customScene, setCustomScene] = useState("");
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0]);
  const [shot, setShot] = useState(SHOT_OPTIONS[0]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const scenePrompt = buildScenePrompt(
    masterPrompt,
    selectedPreset,
    customScene,
    lighting,
    shot,
  );

  async function generateVariants() {
    setLoading(true);
    setGeneratedImages([]);
    try {
      const promises = [0, 1].map(() =>
        fetch("/api/avatar/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: scenePrompt,
            referenceFileIds: sceneReferenceFileIds,
          }),
        }).then(async (r) => {
          const d = await readApiJson<{ imageUrl?: string; error?: string }>(r);
          if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
          return d.imageUrl ?? null;
        }),
      );
      const results = await Promise.all(promises);
      const valid = results.filter(Boolean) as string[];
      setGeneratedImages(valid);
    } catch (e) {
      alert(`Erreur: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAndNext(url: string) {
    setSelectedImage(url);
    onSelectScene(url, selectedPreset?.id);
    onNext();
  }

  const canGenerate = selectedPreset !== null || customScene.trim().length > 10;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-white/50">
        Choisis une scène — génération par <strong className="text-white/60">édition</strong> (GPT Image 2) avec{" "}
        {sceneReferenceFileIds.length} fichier(s) image OpenAI : photo uploadée + feuille de refs.
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
              onClick={() => { setSelectedPreset(preset); setCustomScene(""); }}
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
            onClick={() => setSelectedPreset(null)}
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
            onChange={(e) => setCustomScene(e.target.value)}
            rows={3}
            placeholder="Ex: sitting at a poker table in a Vegas casino, surrounded by chips, confident expression, dramatic overhead light…"
            className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Lumière</label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60"
              >
                {LIGHTING_OPTIONS.map((l) => (
                  <option key={l} value={l} className="bg-neutral-900">{l}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Cadrage</label>
              <select
                value={shot}
                onChange={(e) => setShot(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60"
              >
                {SHOT_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900">{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Prompt preview */}
      <div className="rounded-xl border border-white/8 bg-white/3">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setShowPrompt(!showPrompt)}
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
        onClick={generateVariants}
        disabled={!canGenerate || loading}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {loading ? "Génération des 2 variantes…" : "Générer 2 variantes"}
      </button>

      {generatedImages.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
            Choisir la meilleure variante
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {generatedImages.map((url, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === url ? "border-violet-500" : "border-white/10 hover:border-white/30"
                  }`}
                  onClick={() => setSelectedImage(url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Variante ${i + 1}`} className="w-full object-cover" />
                  {selectedImage === url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-600/20">
                      <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                        Sélectionnée ✓
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSelectAndNext(url)}
                  className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                >
                  Animer cette scène →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
