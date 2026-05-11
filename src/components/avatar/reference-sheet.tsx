"use client";

import { useState } from "react";
import { buildReferencePrompt, REFERENCE_ANGLES, ReferenceAngle } from "@/lib/avatar-prompts";

interface Props {
  masterPrompt: string;
  referenceImageBase64: string;
  mimeType: string;
  images: Partial<Record<ReferenceAngle, string>>;
  onImagesChange: (imgs: Partial<Record<ReferenceAngle, string>>) => void;
  onNext: () => void;
}

// Order matters — each angle gets all previous angles as context
const ANGLE_ORDER: ReferenceAngle[] = [
  "front",
  "back",
  "left_profile",
  "three_quarters",
  "close_up",
];

async function callGenerateImage(
  prompt: string,
): Promise<string> {
  const res = await fetch("/api/avatar/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      size: "1024x1536",
    }),
  });
  const data = (await res.json()) as { imageUrl?: string; error?: string };
  if (!res.ok || !data.imageUrl) throw new Error(data.error ?? "Generation failed");
  return data.imageUrl;
}

export function ReferenceSheet({
  masterPrompt,
  referenceImageBase64,
  mimeType,
  images,
  onImagesChange,
  onNext,
}: Props) {
  const [loading, setLoading] = useState<Partial<Record<ReferenceAngle, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<ReferenceAngle, string>>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  // Get all generated image URLs ordered before a given angle index
  function getPreviousUrls(currentIndex: number, currentImages: Partial<Record<ReferenceAngle, string>>): string[] {
    return ANGLE_ORDER
      .slice(0, currentIndex)
      .map((id) => currentImages[id])
      .filter(Boolean) as string[];
  }

  async function generateOne(
    angleId: ReferenceAngle,
    currentImages: Partial<Record<ReferenceAngle, string>>,
  ): Promise<Partial<Record<ReferenceAngle, string>>> {
    setLoading((prev) => ({ ...prev, [angleId]: true }));
    setErrors((prev) => ({ ...prev, [angleId]: undefined }));

    const angleIndex = ANGLE_ORDER.indexOf(angleId);
    const previousUrls = getPreviousUrls(angleIndex, currentImages);

    try {
      const prompt = buildReferencePrompt(masterPrompt, angleId);
      const url = await callGenerateImage(prompt);
      const next = { ...currentImages, [angleId]: url };
      onImagesChange(next);
      return next;
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [angleId]: e instanceof Error ? e.message : "Erreur",
      }));
      return currentImages;
    } finally {
      setLoading((prev) => ({ ...prev, [angleId]: false }));
    }
  }

  // Sequential: each angle passes all previously generated ones as context
  async function generateAll() {
    setGeneratingAll(true);
    let current = { ...images };
    for (const angleId of ANGLE_ORDER) {
      current = await generateOne(angleId, current);
    }
    setGeneratingAll(false);
  }

  // Individual regeneration: use all images BEFORE this angle as context
  async function regenerate(angleId: ReferenceAngle) {
    await generateOne(angleId, { ...images, [angleId]: undefined });
  }

  const hasAll = ANGLE_ORDER.every((a) => images[a]);
  const anyLoading = Object.values(loading).some(Boolean) || generatingAll;

  return (
    <div className="flex flex-col gap-6">
      {/* Reference photo + instructions */}
      <div className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:${mimeType};base64,${referenceImageBase64}`}
          alt="Reference"
          className="h-20 w-16 flex-shrink-0 rounded-lg object-cover ring-2 ring-violet-500/40"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/80">Photo de référence active</p>
          <p className="mt-1 text-xs text-white/45 leading-relaxed">
            Génération séquentielle — chaque angle passe la photo + tous les angles précédents comme
            contexte. Ultra-cohérence garantie.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/30">
            {ANGLE_ORDER.map((id, i) => {
              const label = REFERENCE_ANGLES.find((a) => a.id === id)?.label ?? id;
              const done = !!images[id];
              const isLoading = !!loading[id];
              return (
                <span
                  key={id}
                  className={`rounded px-1.5 py-0.5 border ${
                    isLoading
                      ? "border-violet-500/50 text-violet-400"
                      : done
                        ? "border-green-500/30 text-green-400"
                        : "border-white/10 text-white/30"
                  }`}
                >
                  {i + 1}. {label}
                </span>
              );
            })}
          </div>
        </div>
        <button
          onClick={generateAll}
          disabled={anyLoading}
          className="flex-shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:opacity-50"
        >
          {generatingAll ? "Génération…" : "Tout générer"}
        </button>
      </div>

      {/* 5 angle cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {REFERENCE_ANGLES.map((angle) => {
          const angleIndex = ANGLE_ORDER.indexOf(angle.id);
          const isLoading = !!loading[angle.id];
          const err = errors[angle.id];
          const url = images[angle.id];
          const prevCount = getPreviousUrls(angleIndex, images).length;

          return (
            <div key={angle.id} className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {isLoading ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-violet-500" />
                    <span className="text-center text-xs text-white/30 px-2">
                      {prevCount > 0 ? `+ ${prevCount} référence(s)…` : "Génération…"}
                    </span>
                  </div>
                ) : url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={angle.label} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs font-medium text-white/90">
                      {angle.label}
                    </span>
                    {/* Context badge */}
                    <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] text-white/60">
                      ref+{angleIndex}
                    </span>
                  </>
                ) : err ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
                    <span className="text-xs text-red-400">{err.slice(0, 80)}</span>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className="text-2xl opacity-30">{angle.icon}</span>
                    <span className="text-xs text-white/25 text-center px-1">{angle.label}</span>
                    {angleIndex > 0 && (
                      <span className="text-[10px] text-white/20 text-center px-1">
                        utilisera {angleIndex} img précédente{angleIndex > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => regenerate(angle.id)}
                disabled={isLoading || generatingAll}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                {url ? "Régénérer" : "Générer"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs text-amber-400/80">
          ⚠️ Si un visage diverge → clique <strong>Régénérer</strong> immédiatement.
          Chaque angle utilise tous les précédents comme référence — l&apos;ordre compte.
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!hasAll}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {hasAll
          ? "Générer les scènes →"
          : `Encore ${ANGLE_ORDER.filter((a) => !images[a]).length} angle(s) à générer`}
      </button>
    </div>
  );
}
