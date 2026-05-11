"use client";

import { useRef, useState } from "react";

interface Props {
  onReady: (data: { masterPrompt: string; imageBase64: string; mimeType: string }) => void;
}

export function PhotoUploader({ onReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [masterPrompt, setMasterPrompt] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setMimeType(file.type);
    setMasterPrompt(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      // Strip the data:image/...;base64, prefix
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function analyze() {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    setMasterPrompt(null);

    try {
      const res = await fetch("/api/avatar/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const data = (await res.json()) as { masterPrompt?: string; error?: string };
      if (!res.ok || !data.masterPrompt) throw new Error(data.error ?? "Analysis failed");
      setMasterPrompt(data.masterPrompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setAnalyzing(false);
    }
  }

  function proceed() {
    if (!masterPrompt || !imageBase64) return;
    onReady({ masterPrompt, imageBase64, mimeType });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-white/50">
        Upload une photo claire de la personne — de face de préférence, visage bien visible.
        Claude analysera chaque détail et générera le prompt maître automatiquement.
      </p>

      {/* Drop zone */}
      <div
        className={`relative flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition ${
          preview
            ? "border-violet-500/40 bg-violet-600/5"
            : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5"
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Reference"
              className="max-h-72 rounded-xl object-contain shadow-xl"
            />
            <p className="text-xs text-white/40">Clique pour changer la photo</p>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
              📸
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/70">
                Glisse une photo ici ou clique pour choisir
              </p>
              <p className="mt-1 text-xs text-white/30">JPG, PNG, WEBP — de face, visage visible</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Analyze button */}
      {imageBase64 && !masterPrompt && (
        <button
          onClick={analyze}
          disabled={analyzing}
          className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Claude analyse le visage…
            </span>
          ) : (
            "Analyser avec Claude →"
          )}
        </button>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Generated master prompt */}
      {masterPrompt && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
            <span className="text-green-400">✓</span>
            <p className="text-sm text-green-400/90 font-medium">
              Prompt maître généré — {masterPrompt.split(" ").length} mots, tous les détails capturés.
            </p>
          </div>

          {/* Prompt preview + edit */}
          <div className="rounded-xl border border-white/8 bg-white/3">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setShowPrompt(!showPrompt)}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Prompt maître généré
              </span>
              <span className="text-xs text-white/30">{showPrompt ? "Masquer ▲" : "Voir / Modifier ▼"}</span>
            </button>
            {showPrompt && (
              <div className="border-t border-white/8 px-4 pb-4 pt-3">
                <textarea
                  value={masterPrompt}
                  onChange={(e) => setMasterPrompt(e.target.value)}
                  rows={8}
                  className="w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-white/70 outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={analyze}
              disabled={analyzing}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              Régénérer le prompt
            </button>
            <button
              onClick={proceed}
              className="flex-[2] rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 active:scale-[0.98]"
            >
              Générer la Reference Sheet 360° →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
