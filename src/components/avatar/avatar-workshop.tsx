"use client";

import {
  createDefaultContentBrief,
  type ContentBriefPersisted,
} from "@/lib/avatar-content-brief";
import { AI_MODEL_LABELS } from "@/lib/avatar-ai-models";
import { requestAvatarImageGeneration } from "@/lib/avatar-image-client";
import {
  buildScenePrompt,
  SCENE_PRESETS,
  type ScenePreset,
} from "@/lib/avatar-prompts";
import { readApiJson } from "@/lib/read-api-json";
import {
  clearWorkshopSnapshot,
  loadWorkshopSnapshot,
  saveWorkshopSnapshot,
} from "@/lib/avatar-workshop-persistence";
import {
  createInitialWorkshop,
  mergeMasterPrompts,
  type PersistedChatMessage,
  type WorkshopSession,
  type WorkshopSnapshotV2,
} from "@/lib/avatar-workshop-types";
import { ChatRichText } from "./chat-rich-text";
import {
  parseWorkshopPatchFromAssistant,
} from "@/lib/studio-system-prompt";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VideoAnimator } from "./video-animator";

const MAX_SCENE_REFERENCE_FILES = 4;

const SAVE_MS = 400;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result as string;
      const comma = dataUrl.indexOf(",");
      const raw = dataUrl.slice(comma + 1);
      const mime = file.type || "image/jpeg";
      resolve({ base64: raw, mimeType: mime });
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

interface UiMessage extends PersistedChatMessage {
  localPreviews?: { url: string; name: string }[];
}

function workshopToBrief(w: WorkshopSession): ContentBriefPersisted {
  const d = createDefaultContentBrief();
  return {
    ...d,
    personaRole: w.personaSummary.trim() || d.personaRole,
    nicheTopic: w.nicheSummary.trim() || d.nicheTopic,
  };
}

function persistable(ms: UiMessage[]): PersistedChatMessage[] {
  return ms.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    modelLabel: m.modelLabel,
    attachmentCount: m.attachmentCount,
  }));
}

export function AvatarWorkshop() {
  const [hydrated, setHydrated] = useState(false);
  const [workshop, setWorkshop] = useState<WorkshopSession>(createInitialWorkshop());
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scenePresetId, setScenePresetId] = useState<string | null>(SCENE_PRESETS[0]?.id ?? null);
  const [customScene, setCustomScene] = useState("");
  const [sceneGenLoading, setSceneGenLoading] = useState(false);

  const [snapExtra, setSnapExtra] = useState({
    lastSceneImageUrl: null as string | null,
    lastScenePresetId: null as string | null,
    customSceneDescription: "",
  });

  const listRef = useRef<HTMLDivElement>(null);
  const workshopRef = useRef(workshop);
  workshopRef.current = workshop;

  const sceneReferenceFileIds = useMemo(
    () => workshop.referenceFileIds.slice(0, MAX_SCENE_REFERENCE_FILES),
    [workshop.referenceFileIds],
  );

  const selectedPreset = useMemo((): ScenePreset | null => {
    if (!scenePresetId) return null;
    return SCENE_PRESETS.find((p) => p.id === scenePresetId) ?? null;
  }, [scenePresetId]);

  const sceneLighting = selectedPreset?.lighting ?? "Golden hour warm sunlight";
  const sceneShot = selectedPreset?.shot ?? "Medium shot";

  const scenePrompt = useMemo(() => {
    if (!workshop.masterPrompt?.trim()) return "";
    return buildScenePrompt(
      workshop.masterPrompt,
      selectedPreset,
      customScene,
      sceneLighting,
      sceneShot,
      workshopToBrief(workshop),
    );
  }, [workshop, selectedPreset, customScene, sceneLighting, sceneShot]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadWorkshopSnapshot();
      if (cancelled) return;
      if (s) {
        setWorkshop(s.workshop);
        setMessages(s.messages.map((m) => ({ ...m })));
        setSnapExtra({
          lastSceneImageUrl: s.lastSceneImageUrl,
          lastScenePresetId: s.lastScenePresetId,
          customSceneDescription: s.customSceneDescription,
        });
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
      const snap: WorkshopSnapshotV2 = {
        version: 2,
        workshop,
        messages: persistable(messages),
        lastSceneImageUrl: snapExtra.lastSceneImageUrl,
        lastScenePresetId: snapExtra.lastScenePresetId,
        customSceneDescription: snapExtra.customSceneDescription,
        savedAt: Date.now(),
      };
      void saveWorkshopSnapshot(snap);
    }, SAVE_MS);
    return () => clearTimeout(t);
  }, [hydrated, workshop, messages, snapExtra]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatLoading]);

  const mergeWorkshopPatch = useCallback((patch: Partial<WorkshopSession>) => {
    setWorkshop((w) => ({ ...w, ...patch }));
  }, []);

  async function ingestImages(
    files: File[],
    current: WorkshopSession,
  ): Promise<{
    previews: { url: string; name: string }[];
    imagesForClaude: { base64: string; mediaType: string }[];
    nextWorkshop: WorkshopSession;
  }> {
    const previews: { url: string; name: string }[] = [];
    const imagesForClaude: { base64: string; mediaType: string }[] = [];
    let nextMaster = current.masterPrompt;
    const nextIds = [...current.referenceFileIds];

    for (const file of files) {
      const { base64, mimeType } = await fileToBase64(file);
      previews.push({ url: URL.createObjectURL(file), name: file.name });
      imagesForClaude.push({ base64, mediaType: mimeType });

      const [up, an] = await Promise.all([
        fetch("/api/avatar/upload-reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        }),
        fetch("/api/avatar/analyze-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        }),
      ]);
      const upJ = await readApiJson<{ fileId?: string; error?: string }>(up);
      const anJ = await readApiJson<{ masterPrompt?: string; error?: string }>(an);
      if (!up.ok || !upJ.fileId) throw new Error(upJ.error ?? "upload OpenAI");
      if (!an.ok || !anJ.masterPrompt) throw new Error(anJ.error ?? "analyse Claude");

      if (!nextIds.includes(upJ.fileId)) nextIds.push(upJ.fileId);
      nextMaster = mergeMasterPrompts(nextMaster, anJ.masterPrompt);
    }

    const nextWorkshop: WorkshopSession = {
      ...current,
      masterPrompt: nextMaster,
      referenceFileIds: nextIds,
      phase: current.phase === "intake" ? "references" : current.phase,
    };
    setWorkshop(nextWorkshop);
    return { previews, imagesForClaude, nextWorkshop };
  }

  async function callStudioChat(args: {
    sessionStart?: boolean;
    text: string;
    files: File[];
    workshopSnapshot?: WorkshopSession;
  }) {
    setChatLoading(true);
    setError(null);
    let userText = args.text.trim();
    let previews: { url: string; name: string }[] = [];
    let imagesForClaude: { base64: string; mediaType: string }[] = [];
    let w = args.workshopSnapshot ?? workshopRef.current;

    let rolledUser = false;
    try {
      if (args.files.length > 0) {
        const ing = await ingestImages(args.files, w);
        previews = ing.previews;
        imagesForClaude = ing.imagesForClaude;
        w = ing.nextWorkshop;
        if (!userText) {
          userText = `J’envoie ${args.files.length} photo(s) de référence pour mon avatar (vraies prises). Dis-moi si la couverture d’angles suffit.`;
        }
      }

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (!args.sessionStart && !userText && imagesForClaude.length === 0) return;

      const userMsg: UiMessage = {
        id: newId(),
        role: "user",
        content:
          userText +
          (args.files.length
            ? `\n\n_${args.files.length} fichier(s) — ${AI_MODEL_LABELS.claudeVision} + upload OpenAI refs._`
            : ""),
        attachmentCount: args.files.length || undefined,
        localPreviews: previews.length ? previews : undefined,
      };
      setMessages((m) => [...m, userMsg]);
      rolledUser = true;

      const res = await fetch("/api/avatar/studio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionStart: args.sessionStart === true,
          userText,
          userImages: imagesForClaude,
          history,
          workshop: w,
        }),
      });
      const data = await readApiJson<{ message?: string; model?: string; error?: string }>(res);
      if (!res.ok || !data.message) throw new Error(data.error ?? "Chat échoué");

      const rawAssistant = data.message;
      const patch = parseWorkshopPatchFromAssistant(rawAssistant);
      if (patch) mergeWorkshopPatch(patch);

      const modelLabel =
        data.model != null ? `Claude · ${data.model}` : AI_MODEL_LABELS.claudeStudio;

      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          content: rawAssistant,
          modelLabel,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      if (rolledUser) setMessages((m) => m.slice(0, -1));
      if (args.files.length > 0) setPendingFiles(args.files);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleNewAvatar() {
    await clearWorkshopSnapshot();
    setWorkshop(createInitialWorkshop());
    setMessages([]);
    setInput("");
    setPendingFiles([]);
    setSnapExtra({
      lastSceneImageUrl: null,
      lastScenePresetId: null,
      customSceneDescription: "",
    });
    setError(null);
    setChatLoading(true);
    try {
      const res = await fetch("/api/avatar/studio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionStart: true,
          userText: "",
          userImages: [],
          history: [],
          workshop: createInitialWorkshop(),
        }),
      });
      const data = await readApiJson<{ message?: string; model?: string; error?: string }>(res);
      if (!res.ok || !data.message) throw new Error(data.error ?? "Échec démarrage");
      const modelLabel =
        data.model != null ? `Claude · ${data.model}` : AI_MODEL_LABELS.claudeStudio;
      setMessages([
        {
          id: newId(),
          role: "assistant",
          content: data.message,
          modelLabel,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setChatLoading(false);
    }
  }

  function lockRefsAndGoCreative() {
    if (workshop.referenceFileIds.length === 0) {
      setError("Ajoute au moins une photo de référence avant de verrouiller.");
      return;
    }
    const next: WorkshopSession = { ...workshop, refsLocked: true, phase: "creative" };
    setWorkshop(next);
    void callStudioChat({
      text: "Je **verrouille** mes références : j’ai assez d’angles pour la cohérence. Passons en **mode créatif** — je veux qu’on travaille des idées de scènes et de concepts.",
      files: [],
      workshopSnapshot: next,
    });
  }

  async function generateSceneImage() {
    if (!workshop.masterPrompt?.trim()) {
      setError("Il faut un prompt maître — envoie des photos analysées.");
      return;
    }
    if (!sceneReferenceFileIds.length) {
      setError("Aucune référence OpenAI — envoie des photos.");
      return;
    }
    if (!selectedPreset && customScene.trim().length < 8) {
      setError("Choisis un preset ou décris une scène (≥ 8 caractères).");
      return;
    }
    setSceneGenLoading(true);
    setError(null);
    try {
      const out = await requestAvatarImageGeneration(scenePrompt, sceneReferenceFileIds);
      setSnapExtra((s) => ({
        ...s,
        lastSceneImageUrl: out.imageUrl,
        lastScenePresetId: selectedPreset?.id ?? null,
        customSceneDescription: selectedPreset ? "" : customScene.trim(),
      }));
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          content: `**Scène générée** avec ${AI_MODEL_LABELS.gptImage2}. Tu peux l’animer en vidéo (Kling) ci-dessous.`,
          modelLabel: AI_MODEL_LABELS.gptImage2,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSceneGenLoading(false);
    }
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setPendingFiles((p) => [...p, ...list]);
    e.target.value = "";
  }

  return (
    <div className="flex h-[calc(100dvh-52px)] flex-col bg-[#080808]">
      <header className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold text-white">Atelier Avatar</h1>
          <p className="text-[10px] text-white/40">
            {AI_MODEL_LABELS.claudeStudio} · {AI_MODEL_LABELS.gptImage2} · {AI_MODEL_LABELS.klingVideo}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
            Phase :{" "}
            <strong className="text-white/70">
              {workshop.phase === "intake"
                ? "Découverte"
                : workshop.phase === "references"
                  ? "Références"
                  : "Créatif"}
            </strong>
            {workshop.referenceFileIds.length > 0 ? (
              <span className="text-white/35"> · {workshop.referenceFileIds.length} ref. OpenAI</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => void handleNewAvatar()}
            disabled={chatLoading}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
          >
            Créer mon avatar
          </button>
          <button
            type="button"
            onClick={() => lockRefsAndGoCreative()}
            disabled={chatLoading || workshop.referenceFileIds.length === 0}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            Verrouiller les refs
          </button>
          <Link
            href="/avatar/carousel"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/55 hover:bg-white/5"
          >
            Concept carrousel
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {!hydrated ? (
          <p className="text-sm text-white/40">Chargement…</p>
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/70">
              Clique sur <strong className="text-white">Créer mon avatar</strong> : Claude démarre la
              discussion, te pose des questions, puis tu ajoutes une ou plusieurs photos quand tu veux — pas
              d’étapes imposées.
            </p>
          </div>
        ) : null}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[min(100%,640px)] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-violet-600/20 text-white/90"
                  : "bg-white/[0.06] text-white/85"
              }`}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  {m.role === "user" ? "Toi" : "Assistant"}
                </span>
                {m.modelLabel ? (
                  <span className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-[9px] font-medium text-violet-300/90">
                    {m.modelLabel}
                  </span>
                ) : null}
              </div>
              {m.localPreviews?.length ? (
                <div className="mb-2 flex flex-wrap gap-2">
                  {m.localPreviews.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.url}
                      src={p.url}
                      alt={p.name}
                      className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10"
                    />
                  ))}
                </div>
              ) : null}
              <ChatRichText content={m.content} />
            </div>
          </div>
        ))}
        {chatLoading ? (
          <p className="text-xs text-white/40">Assistant en cours… ({AI_MODEL_LABELS.claudeStudio})</p>
        ) : null}
      </div>

      {error ? (
        <div className="flex-shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}

      {/* Production dock */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/40 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Génération de contenu (après refs)
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 text-xs font-medium text-white/60">Image de scène — {AI_MODEL_LABELS.gptImage2}</div>
            <div className="mb-2 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              {SCENE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setScenePresetId(p.id);
                    setCustomScene("");
                  }}
                  className={`rounded-lg border px-2 py-1 text-[10px] ${
                    scenePresetId === p.id
                      ? "border-violet-500/60 bg-violet-600/20 text-white"
                      : "border-white/10 text-white/55 hover:bg-white/5"
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setScenePresetId(null)}
                className={`rounded-lg border px-2 py-1 text-[10px] ${
                  scenePresetId === null
                    ? "border-violet-500/60 bg-violet-600/20 text-white"
                    : "border-white/10 text-white/55"
                }`}
              >
                Perso
              </button>
            </div>
            {!selectedPreset ? (
              <textarea
                value={customScene}
                onChange={(e) => setCustomScene(e.target.value)}
                rows={2}
                placeholder="Décris ta scène…"
                className="mb-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder-white/25"
              />
            ) : null}
            <button
              type="button"
              onClick={() => void generateSceneImage()}
              disabled={
                sceneGenLoading ||
                (!workshop.refsLocked && workshop.phase !== "creative")
              }
              className="w-full rounded-lg bg-fuchsia-600 py-2 text-xs font-semibold text-white hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {workshop.refsLocked || workshop.phase === "creative"
                ? sceneGenLoading
                  ? "Génération…"
                  : "Générer la scène"
                : "Verrouille les refs ou passe en créatif avec Claude"}
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 text-xs font-medium text-white/60">Vidéo — {AI_MODEL_LABELS.klingVideo}</div>
            {snapExtra.lastSceneImageUrl ? (
              <VideoAnimator
                sceneImageUrl={snapExtra.lastSceneImageUrl}
                scenePresetId={snapExtra.lastScenePresetId ?? undefined}
                customSceneDescription={
                  snapExtra.lastScenePresetId ? undefined : snapExtra.customSceneDescription || undefined
                }
              />
            ) : (
              <p className="text-[11px] text-white/35">Génère d’abord une image de scène.</p>
            )}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 border-t border-white/10 bg-[#0a0a0a] p-4">
        {pendingFiles.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2 text-[10px] text-white/45">
            {pendingFiles.map((f) => (
              <span key={f.name + f.size} className="rounded bg-white/10 px-2 py-0.5">
                {f.name}
              </span>
            ))}
            <button type="button" onClick={() => setPendingFiles([])} className="text-red-400/80">
              effacer fichiers
            </button>
          </div>
        ) : null}
        <div className="mx-auto flex max-w-4xl gap-2">
          <label className="flex cursor-pointer items-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/55 transition hover:bg-white/10">
            +
            <input type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Réponds à Claude ou décris ce que tu envoies comme photos…"
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-violet-500/50 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const files = pendingFiles;
                setPendingFiles([]);
                void callStudioChat({ text: input, files });
                setInput("");
              }
            }}
          />
          <button
            type="button"
            disabled={chatLoading}
            onClick={() => {
              const files = pendingFiles;
              setPendingFiles([]);
              void callStudioChat({ text: input, files });
              setInput("");
            }}
            className="self-end rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
