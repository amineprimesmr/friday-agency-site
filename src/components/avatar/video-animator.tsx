"use client";

import { useEffect, useRef, useState } from "react";
import { buildKlingPrompt, ANIMATION_PRESETS, SCENE_PRESETS } from "@/lib/avatar-prompts";

interface Props {
  sceneImageUrl: string;
  scenePresetId?: string;
}

const CAMERA_MOVES = [
  "Static locked frame",
  "Slow push-in zoom",
  "Slow dolly left to right",
  "Orbit left to right",
  "Slow crane up",
  "Handheld slight shake",
  "Slow pull-back reveal",
];

export function VideoAnimator({ sceneImageUrl, scenePresetId }: Props) {
  const preset = scenePresetId
    ? ANIMATION_PRESETS[scenePresetId] ?? null
    : null;

  const [cameraMove, setCameraMove] = useState(
    preset?.cameraMove ?? CAMERA_MOVES[0],
  );
  const [beatByBeat, setBeatByBeat] = useState(preset?.beatByBeat ?? "");
  const [mood, setMood] = useState(preset?.mood ?? "");
  const [duration, setDuration] = useState<"5" | "10">("10");

  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "done" | "error">("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const klingPrompt = buildKlingPrompt({ cameraMove, beatByBeat, mood, duration });

  async function handleGenerate() {
    if (!beatByBeat.trim()) {
      alert("Décris les actions beat-by-beat avant de lancer.");
      return;
    }

    setStatus("generating");
    setVideoUrl(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/avatar/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: klingPrompt, imageUrl: sceneImageUrl, duration }),
      });
      const data = (await res.json()) as { requestId?: string; error?: string };

      if (!res.ok || !data.requestId) throw new Error(data.error ?? "Submit failed");

      setRequestId(data.requestId);
      setStatus("polling");
      startPolling(data.requestId);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : String(e));
    }
  }

  function startPolling(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/avatar/video-status/${id}`);
        const data = (await res.json()) as { status: string; videoUrl: string | null };

        if (data.status === "COMPLETED" && data.videoUrl) {
          clearInterval(pollRef.current!);
          setVideoUrl(data.videoUrl);
          setStatus("done");
        } else if (data.status === "FAILED") {
          clearInterval(pollRef.current!);
          setStatus("error");
          setErrorMsg("La génération vidéo a échoué sur fal.ai");
        }
      } catch {
        // Continue polling on network errors
      }
    }, 8000);
  }

  const sceneLabel =
    SCENE_PRESETS.find((s) => s.id === scenePresetId)?.label ?? "Scene personnalisée";

  return (
    <div className="flex flex-col gap-6">
      {/* Scene preview + video result */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Image source — {sceneLabel}
          </span>
          <div className="overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sceneImageUrl} alt="Scene" className="w-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Vidéo générée — Kling 2.1 Pro
          </span>
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/3">
            {status === "idle" && (
              <p className="text-xs text-white/20">Lance la génération pour voir le résultat</p>
            )}
            {(status === "generating" || status === "polling") && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-violet-500" />
                <p className="text-xs text-white/40">
                  {status === "generating" ? "Envoi en cours…" : "Génération Kling en cours (2-4 min)…"}
                </p>
              </div>
            )}
            {status === "done" && videoUrl && (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="h-full w-full object-cover"
              />
            )}
            {status === "error" && (
              <p className="text-center text-xs text-red-400 px-4">{errorMsg}</p>
            )}
          </div>
          {status === "done" && videoUrl && (
            <a
              href={videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Télécharger la vidéo ↓
            </a>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Camera */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Mouvement caméra
          </label>
          <div className="flex flex-wrap gap-2">
            {CAMERA_MOVES.map((move) => (
              <button
                key={move}
                onClick={() => setCameraMove(move)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  cameraMove === move
                    ? "border-violet-500/60 bg-violet-600/20 text-violet-300"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                }`}
              >
                {move}
              </button>
            ))}
          </div>
        </div>

        {/* Beat-by-beat */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Actions beat-by-beat
          </label>
          <textarea
            value={beatByBeat}
            onChange={(e) => setBeatByBeat(e.target.value)}
            rows={7}
            placeholder={`Décris les actions séquentielles, ligne par ligne:

The character sits at a desk in front of a MacBook Pro.
He leans forward scrolling, expression calm.
Suddenly his eyes go wide with shock...`}
            className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors leading-relaxed"
          />
        </div>

        {/* Mood */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Ambiance / Style
          </label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Ex: Tense, dramatic, relatable — the feeling of seeing something unbelievable"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Durée
          </label>
          <div className="flex gap-3">
            {(["5", "10"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  duration === d
                    ? "border-violet-500/60 bg-violet-600/20 text-violet-300"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Prompt preview */}
        <div className="rounded-xl border border-white/8 bg-white/3">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Prompt Kling généré
            </span>
            <span className="text-xs text-white/30">{showPrompt ? "Masquer ▲" : "Voir ▼"}</span>
          </button>
          {showPrompt && (
            <div className="border-t border-white/8 px-4 pb-4 pt-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/60">
                {klingPrompt}
              </pre>
            </div>
          )}
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={status === "generating" || status === "polling"}
          className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {status === "generating" || status === "polling"
            ? "Génération en cours…"
            : "Animer avec Kling 2.1 Pro →"}
        </button>

        {requestId && (
          <p className="text-center text-xs text-white/25">
            Request ID: <code className="font-mono">{requestId}</code>
          </p>
        )}
      </div>
    </div>
  );
}
