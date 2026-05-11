"use client";

import { useState } from "react";
import {
  buildReferencePrompt,
  REFERENCE_ANGLES,
  REFERENCE_ANGLE_ORDER,
  ReferenceAngle,
} from "@/lib/avatar-prompts";

interface Props {
  masterPrompt: string;
  referenceFileId: string;
  referenceImageBase64: string;
  mimeType: string;
  images: Partial<Record<ReferenceAngle, string>>;
  referenceImageFileIds: Partial<Record<ReferenceAngle, string>>;
  onImagesChange: (imgs: Partial<Record<ReferenceAngle, string>>) => void;
  onReferenceFileIdsChange: (ids: Partial<Record<ReferenceAngle, string>>) => void;
  onNext: () => void;
}

function referenceFileIdsForAngle(
  angleIndex: number,
  originalFileId: string,
  fileIds: Partial<Record<ReferenceAngle, string>>,
): string[] {
  const list = [originalFileId];
  for (let i = 0; i < angleIndex; i++) {
    const id = REFERENCE_ANGLE_ORDER[i];
    const fid = fileIds[id];
    if (fid) list.push(fid);
  }
  return list;
}

async function callGenerateImage(
  prompt: string,
  referenceFileIds: string[],
): Promise<{ imageUrl: string; outputFileId: string }> {
  const res = await fetch("/api/avatar/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      size: "1024x1536",
      referenceFileIds,
    }),
  });
  const data = (await res.json()) as {
    imageUrl?: string;
    outputFileId?: string;
    error?: string;
  };
  if (!res.ok || !data.imageUrl || !data.outputFileId) {
    throw new Error(data.error ?? "Generation failed");
  }
  return { imageUrl: data.imageUrl, outputFileId: data.outputFileId };
}

export function ReferenceSheet({
  masterPrompt,
  referenceFileId,
  referenceImageBase64,
  mimeType,
  images,
  referenceImageFileIds,
  onImagesChange,
  onReferenceFileIdsChange,
  onNext,
}: Props) {
  const [loading, setLoading] = useState<Partial<Record<ReferenceAngle, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<ReferenceAngle, string>>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  function getPreviousUrls(currentIndex: number, currentImages: Partial<Record<ReferenceAngle, string>>): string[] {
    return REFERENCE_ANGLE_ORDER
      .slice(0, currentIndex)
      .map((id) => currentImages[id])
      .filter(Boolean) as string[];
  }

  async function generateOne(
    angleId: ReferenceAngle,
    currentImages: Partial<Record<ReferenceAngle, string>>,
    currentFileIds: Partial<Record<ReferenceAngle, string>>,
  ): Promise<{
    images: Partial<Record<ReferenceAngle, string>>;
    fileIds: Partial<Record<ReferenceAngle, string>>;
  }> {
    setLoading((prev) => ({ ...prev, [angleId]: true }));
    setErrors((prev) => ({ ...prev, [angleId]: undefined }));

    const angleIndex = REFERENCE_ANGLE_ORDER.indexOf(angleId);
    const refIds = referenceFileIdsForAngle(angleIndex, referenceFileId, currentFileIds);

    try {
      const prompt = buildReferencePrompt(masterPrompt, angleId);
      const { imageUrl, outputFileId } = await callGenerateImage(prompt, refIds);
      const nextImages = { ...currentImages, [angleId]: imageUrl };
      const nextFileIds = { ...currentFileIds, [angleId]: outputFileId };
      onImagesChange(nextImages);
      onReferenceFileIdsChange(nextFileIds);
      return { images: nextImages, fileIds: nextFileIds };
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [angleId]: e instanceof Error ? e.message : "Erreur",
      }));
      return { images: currentImages, fileIds: currentFileIds };
    } finally {
      setLoading((prev) => ({ ...prev, [angleId]: false }));
    }
  }

  async function generateAll() {
    setGeneratingAll(true);
    try {
      let currentImages = { ...images };
      let currentFileIds = { ...referenceImageFileIds };
      for (const angleId of REFERENCE_ANGLE_ORDER) {
        const r = await generateOne(angleId, currentImages, currentFileIds);
        currentImages = r.images;
        currentFileIds = r.fileIds;
      }
    } finally {
      setGeneratingAll(false);
    }
  }

  async function regenerate(angleId: ReferenceAngle) {
    const nextFileIds = { ...referenceImageFileIds };
    delete nextFileIds[angleId];
    onReferenceFileIdsChange(nextFileIds);
    await generateOne(angleId, images, nextFileIds);
  }

  const hasAll = REFERENCE_ANGLE_ORDER.every((a) => images[a]);
  const anyLoading = Object.values(loading).some(Boolean) || generatingAll;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:${mimeType};base64,${referenceImageBase64}`}
          alt="Reference"
          className="h-20 w-16 flex-shrink-0 rounded-lg object-cover ring-2 ring-violet-500/40"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/80">Photo de référence (upload OpenAI)</p>
          <p className="mt-1 text-xs text-white/45 leading-relaxed">
            Chaque angle appelle <strong className="text-white/55">GPT Image 2 /images/edits</strong> avec ta
            photo en fichier + les rendus précédents (références multiples) pour verrouiller l’identité.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/30">
            {REFERENCE_ANGLE_ORDER.map((id, i) => {
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {REFERENCE_ANGLES.map((angle) => {
          const angleIndex = REFERENCE_ANGLE_ORDER.indexOf(angle.id);
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
                      {prevCount > 0
                        ? `Édition avec ${prevCount + 1} ref. fichier(s)…`
                        : "Édition photo source…"}
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
                    <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] text-white/60">
                      {referenceFileIdsForAngle(angleIndex, referenceFileId, referenceImageFileIds).length} fichiers
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
                        + {angleIndex} rendu(s) précédent(s) en ref.
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
          ⚠️ Si un visage diverge → <strong>Régénérer</strong> tout de suite. L’ordre des angles compte : chaque
          étape réutilise la photo uploadée + les fichier-images des angles déjà générés.
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!hasAll}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {hasAll
          ? "Générer les scènes →"
          : `Encore ${REFERENCE_ANGLE_ORDER.filter((a) => !images[a]).length} angle(s) à générer`}
      </button>
    </div>
  );
}
