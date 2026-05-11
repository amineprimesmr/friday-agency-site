"use client";

import {
  CharacterBible,
  buildMasterPrompt,
  buildReferencePrompt,
  REFERENCE_ANGLES,
  ReferenceAngle,
} from "@/lib/avatar-prompts";

interface Props {
  bible: CharacterBible;
  images: Partial<Record<ReferenceAngle, string>>;
  onImagesChange: (imgs: Partial<Record<ReferenceAngle, string>>) => void;
  onNext: () => void;
}

async function generateAngle(
  prompt: string,
  aspectRatio: string,
): Promise<string> {
  const res = await fetch("/api/avatar/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio }),
  });
  const data = (await res.json()) as { imageUrl?: string; error?: string };
  if (!res.ok || !data.imageUrl) throw new Error(data.error ?? "Generation failed");
  return data.imageUrl;
}

export function ReferenceSheet({ bible, images, onImagesChange, onNext }: Props) {
  const masterPrompt = buildMasterPrompt(bible);

  const loadingAngles = new Set<ReferenceAngle>();

  async function generateOne(angleId: ReferenceAngle, aspectRatio: string) {
    if (loadingAngles.has(angleId)) return;
    loadingAngles.add(angleId);

    // Force re-render via a workaround: dispatch a custom event
    const container = document.getElementById(`angle-${angleId}`);
    if (container) container.setAttribute("data-loading", "true");

    try {
      const prompt = buildReferencePrompt(masterPrompt, angleId);
      const url = await generateAngle(prompt, aspectRatio);
      onImagesChange({ ...images, [angleId]: url });
    } catch (e) {
      alert(`Erreur pour ${angleId}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      loadingAngles.delete(angleId);
      const container = document.getElementById(`angle-${angleId}`);
      if (container) container.removeAttribute("data-loading");
    }
  }

  async function generateAll() {
    // Sequential to avoid rate limiting
    for (const angle of REFERENCE_ANGLES) {
      await generateOne(angle.id, angle.aspectRatio);
    }
  }

  const hasAll = REFERENCE_ANGLES.every((a) => images[a.id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          Génère les 5 angles de référence de ton personnage. Une cohérence parfaite est clé.
        </p>
        <button
          onClick={generateAll}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500"
        >
          Tout générer
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {REFERENCE_ANGLES.map((angle) => (
          <AngleCard
            key={angle.id}
            angle={angle}
            imageUrl={images[angle.id]}
            onGenerate={() => generateOne(angle.id, angle.aspectRatio)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs text-amber-400/80">
          ⚠️ Si un visage diverge (couleurs différentes, traits qui changent) → cliquer{" "}
          <strong>Régénérer</strong> immédiatement avant de passer à la suite.
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!hasAll}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
      >
        {hasAll ? "Générer les scènes →" : `Encore ${REFERENCE_ANGLES.filter((a) => !images[a.id]).length} angle(s) à générer`}
      </button>
    </div>
  );
}

function AngleCard({
  angle,
  imageUrl,
  onGenerate,
}: {
  angle: (typeof REFERENCE_ANGLES)[number];
  imageUrl?: string;
  onGenerate: () => void;
}) {
  return (
    <div id={`angle-${angle.id}`} className="flex flex-col gap-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={angle.label}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="text-2xl opacity-30">{angle.icon}</span>
            <span className="text-xs text-white/20">{angle.label}</span>
          </div>
        )}
      </div>
      <button
        onClick={onGenerate}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        {imageUrl ? "Régénérer" : `Générer — ${angle.label}`}
      </button>
    </div>
  );
}
