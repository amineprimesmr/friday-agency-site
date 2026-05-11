"use client";

import { useState } from "react";
import {
  buildReferencePrompt,
  REFERENCE_ANGLES,
  ReferenceAngle,
} from "@/lib/avatar-prompts";

interface Props {
  masterPrompt: string;
  referenceImageBase64: string;
  mimeType: string;
  images: Partial<Record<ReferenceAngle, string>>;
  onImagesChange: (imgs: Partial<Record<ReferenceAngle, string>>) => void;
  onNext: () => void;
}

async function generateAngle(
  prompt: string,
  referenceImageBase64: string,
  mimeType: string,
): Promise<string> {
  const res = await fetch("/api/avatar/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, referenceImageBase64, mimeType, size: "1024x1536" }),
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

  async function generateOne(angleId: ReferenceAngle) {
    setLoading((prev) => ({ ...prev, [angleId]: true }));
    setErrors((prev) => ({ ...prev, [angleId]: undefined }));
    try {
      const prompt = buildReferencePrompt(masterPrompt, angleId);
      const url = await generateAngle(prompt, referenceImageBase64, mimeType);
      onImagesChange({ ...images, [angleId]: url });
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [angleId]: e instanceof Error ? e.message : "Erreur",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [angleId]: false }));
    }
  }

  async function generateAll() {
    setGeneratingAll(true);
    for (const angle of REFERENCE_ANGLES) {
      await generateOne(angle.id);
    }
    setGeneratingAll(false);
  }

  const hasAll = REFERENCE_ANGLES.every((a) => images[a.id]);
  const anyLoading = Object.values(loading).some(Boolean) || generatingAll;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          5 angles de référence générés avec ta photo + le prompt maître.
          Si un visage diverge, régénère cet angle immédiatement.
        </p>
        <button
          onClick={generateAll}
          disabled={anyLoading}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:opacity-50"
        >
          {generatingAll ? "Génération…" : "Tout générer"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {REFERENCE_ANGLES.map((angle) => (
          <AngleCard
            key={angle.id}
            angle={angle}
            imageUrl={images[angle.id]}
            isLoading={!!loading[angle.id]}
            error={errors[angle.id]}
            onGenerate={() => generateOne(angle.id)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs text-amber-400/80">
          ⚠️ Si un visage diverge (traits différents, couleurs qui changent) → clique{" "}
          <strong>Régénérer</strong> immédiatement avant de continuer.
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!hasAll}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {hasAll
          ? "Générer les scènes →"
          : `Encore ${REFERENCE_ANGLES.filter((a) => !images[a.id]).length} angle(s) à générer`}
      </button>
    </div>
  );
}

function AngleCard({
  angle,
  imageUrl,
  isLoading,
  error,
  onGenerate,
}: {
  angle: (typeof REFERENCE_ANGLES)[number];
  imageUrl?: string;
  isLoading: boolean;
  error?: string;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-violet-500" />
            <span className="text-xs text-white/30">Génération…</span>
          </div>
        ) : imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={angle.label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 text-xs font-medium text-white/80">
              {angle.label}
            </span>
          </>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
            <span className="text-xs text-red-400">{error.slice(0, 60)}</span>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="text-2xl opacity-30">{angle.icon}</span>
            <span className="text-xs text-white/20">{angle.label}</span>
          </div>
        )}
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
      >
        {imageUrl ? "Régénérer" : `Générer`}
      </button>
    </div>
  );
}
