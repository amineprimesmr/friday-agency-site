"use client";

import type { ContentBriefPersisted } from "@/lib/avatar-content-brief";
import { createDefaultContentBrief } from "@/lib/avatar-content-brief";
import { loadAvatarStudioSnapshot } from "@/lib/avatar-studio-persistence";
import { loadWorkshopSnapshot } from "@/lib/avatar-workshop-persistence";
import {
  CAROUSEL_CONTENT_FORMATS,
  SHORT_VIDEO_FORMATS,
  TIKTOK_VERTICAL,
} from "@/lib/carousel-formats";
import {
  type CarouselConceptProposal,
  parseCarouselProposalFromAssistantText,
} from "@/lib/carousel-concept-schema";
import { readApiJson } from "@/lib/read-api-json";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export function CarouselConceptStudio() {
  const [contentBrief, setContentBrief] = useState<ContentBriefPersisted | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carouselPick, setCarouselPick] = useState<string | null>("story_arc");
  const [videoPick, setVideoPick] = useState<string | null>("talking_head_hook");
  const [proposal, setProposal] = useState<CarouselConceptProposal | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshBrief = useCallback(async () => {
    const ws = await loadWorkshopSnapshot();
    const w = ws?.workshop;
    if (w && (w.personaSummary.trim() || w.nicheSummary.trim())) {
      const d = createDefaultContentBrief();
      setContentBrief({
        ...d,
        personaRole: w.personaSummary.trim() || d.personaRole,
        nicheTopic: w.nicheSummary.trim() || d.nicheTopic,
      });
      return;
    }
    const snap = await loadAvatarStudioSnapshot();
    setContentBrief(snap?.contentBrief ?? null);
  }, []);

  useEffect(() => {
    void refreshBrief();
  }, [refreshBrief]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const contextPrefix = useMemo(() => {
    const parts: string[] = [];
    if (carouselPick) {
      const f = CAROUSEL_CONTENT_FORMATS.find((x) => x.id === carouselPick);
      if (f) {
        parts.push(
          `[Format carrousel sélectionné dans l’app : **${f.id}** (${f.label}) — ${f.description}]`,
        );
      }
    }
    if (videoPick) {
      const v = SHORT_VIDEO_FORMATS.find((x) => x.id === videoPick);
      if (v) {
        parts.push(
          `[Format vidéo courte envisagé (TikTok 9:16) : **${v.id}** (${v.label}) — ~${v.durationSec.ideal}s — ${v.description}]`,
        );
      }
    }
    if (parts.length === 0) return "";
    return `${parts.join("\n")}\n\n`;
  }, [carouselPick, videoPick]);

  async function sendMessage(override?: string) {
    const raw = (override ?? input).trim();
    if (!raw || loading) return;
    const userContent = `${contextPrefix}${raw}`;
    const next: ChatMessage[] = [...messages, { role: "user", content: userContent }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/avatar/carousel-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          contentBrief: contentBrief ?? undefined,
        }),
      });
      const data = await readApiJson<{ message?: string; error?: string }>(res);
      if (!res.ok || !data.message) throw new Error(data.error ?? "Échec du chat");
      const assistantText = data.message;
      setMessages((m) => [...m, { role: "assistant", content: assistantText }]);
      const parsed = parseCarouselProposalFromAssistantText(assistantText);
      if (parsed) setProposal(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setMessages((m) => {
        const cut = m.slice(0, -1);
        return cut;
      });
      if (!override) setInput(raw);
    } finally {
      setLoading(false);
    }
  }

  function importBriefIntoChat() {
    if (!contentBrief?.personaRole?.trim() && !contentBrief?.nicheTopic?.trim()) {
      setError("Aucun brief trouvé — remplis d’abord l’étape Brief du Studio Avatar.");
      return;
    }
    const lines = [
      "Voici mon brief créateur (depuis le Studio Avatar) :",
      `— Persona : ${contentBrief.personaRole}`,
      `— Niche : ${contentBrief.nicheTopic}`,
      contentBrief.credibilityNotes.trim()
        ? `— Crédibilité : ${contentBrief.credibilityNotes}`
        : "",
      `— Ton : ${contentBrief.tone}`,
      `— Plateformes : ${[contentBrief.platforms.tiktok && "TikTok", contentBrief.platforms.reels && "Reels", contentBrief.platforms.shorts && "Shorts"].filter(Boolean).join(", ")}`,
      contentBrief.inspirationAccounts.trim()
        ? `— Inspiration style : ${contentBrief.inspirationAccounts}`
        : "",
      contentBrief.contentPillars.trim() ? `— Piliers : ${contentBrief.contentPillars}` : "",
      contentBrief.topicsToAvoid.trim() ? `— À éviter : ${contentBrief.topicsToAvoid}` : "",
    ].filter(Boolean);
    setInput(lines.join("\n"));
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400/80">
          TikTok · 9:16 · carrousel & vidéo
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Concepts carrousel & vidéo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Discute avec Claude pour cadrer ton idée ; quand tu valides, le modèle formalise un plan de
          slides (carrousel) ou de beats (vidéo courte) au format JSON prêt à produire.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/35">
          <span>{TIKTOK_VERTICAL.width}×{TIKTOK_VERTICAL.height}px</span>
          <span>·</span>
          <span>{TIKTOK_VERTICAL.aspectRatio}</span>
          <span>·</span>
          <span>Carrousel idéal {TIKTOK_VERTICAL.carouselRecommendedSlides.min}–{TIKTOK_VERTICAL.carouselRecommendedSlides.ideal} slides</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Col formats */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Formats carrousel
            </h2>
            <p className="mt-1 text-[11px] text-white/35">
              Le format choisi est ajouté au prochain message (contexte).
            </p>
            <div className="mt-3 grid max-h-[280px] gap-2 overflow-y-auto pr-1 sm:max-h-[360px]">
              {CAROUSEL_CONTENT_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCarouselPick(f.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                    carouselPick === f.id
                      ? "border-violet-500/70 bg-violet-600/15 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20"
                  }`}
                >
                  <span className="mr-1.5">{f.emoji}</span>
                  <span className="font-semibold">{f.label}</span>
                  <span className="mt-0.5 block text-[10px] text-white/40">{f.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Formats vidéo courte (suite logique)
            </h2>
            <div className="mt-3 grid max-h-[220px] gap-2 overflow-y-auto pr-1">
              {SHORT_VIDEO_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setVideoPick(f.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                    videoPick === f.id
                      ? "border-fuchsia-500/60 bg-fuchsia-600/10 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20"
                  }`}
                >
                  <span className="mr-1.5">{f.emoji}</span>
                  <span className="font-semibold">{f.label}</span>
                  <span className="mt-0.5 block text-[10px] text-white/40">
                    ~{f.durationSec.ideal}s · {f.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refreshBrief()}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/10"
            >
              Rafraîchir le brief Studio
            </button>
            <button
              type="button"
              onClick={importBriefIntoChat}
              className="rounded-lg border border-violet-500/40 bg-violet-600/15 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-600/25"
            >
              Importer le brief dans le message
            </button>
            <Link
              href="/avatar"
              className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/50 transition hover:text-white/75"
            >
              ← Studio Avatar
            </Link>
          </div>
          {contentBrief?.personaRole?.trim() ? (
            <p className="text-[11px] text-emerald-400/80">Brief Studio détecté ✓</p>
          ) : (
            <p className="text-[11px] text-white/30">Pas de brief en session (étape 1 du Studio).</p>
          )}
        </div>

        {/* Chat + proposition */}
        <div className="flex flex-col gap-4">
          <div className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-black/40 sm:min-h-[480px]">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="text-sm text-white/35">
                  Décris ton idée de carrousel ou de vidéo, ou importe ton brief. Claude va te challenger
                  légèrement puis proposer des angles. Quand c’est bon, demande la version JSON finale.
                </p>
              ) : null}
              {messages.map((m, i) => (
                <div
                  key={`${i}-${m.role}`}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-violet-600/25 text-white/90"
                        : "bg-white/[0.06] text-white/80"
                    }`}
                  >
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      {m.role === "user" ? "Toi" : "Claude"}
                    </span>
                    <pre className="whitespace-pre-wrap">{stripJsonFenceForDisplay(m.content)}</pre>
                  </div>
                </div>
              ))}
              {loading ? (
                <p className="text-xs text-white/40">Claude réfléchit…</p>
              ) : null}
              <div ref={bottomRef} />
            </div>

            {error ? (
              <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-200">
                {error}
              </div>
            ) : null}

            <div className="border-t border-white/10 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                placeholder="Ex. : carrousel sur les 3 erreurs que je vois en franchise resto…"
                className="mb-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/50"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage()}
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
                >
                  Envoyer
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    void sendMessage(
                      "C’est bon pour moi : envoie la **version finale** avec le bloc JSON (carrousel ou vidéo courte) comme convenu.",
                    )
                  }
                  className="rounded-xl border border-violet-500/50 bg-violet-500/10 px-4 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-40"
                >
                  Valider → JSON final
                </button>
              </div>
            </div>
          </div>

          {proposal ? (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Proposition structurée
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-white">{proposal.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/45">
                    {proposal.deliveryMode === "carousel" ? "Carrousel" : "Vidéo courte"} ·{" "}
                    {proposal.formatId} · {proposal.aspectRatio}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
                  }}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70 hover:bg-white/10"
                >
                  Copier JSON
                </button>
              </div>
              <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                {proposal.slides.map((s) => (
                  <li
                    key={s.index}
                    className="rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-white/80"
                  >
                    <span className="font-semibold text-violet-300">Slide {s.index}</span>
                    <span className="text-white/35"> · {s.role}</span>
                    <p className="mt-1 text-white/70">{s.onScreenText}</p>
                    {s.visualDirection ? (
                      <p className="mt-1 text-[10px] text-white/45">Visuel : {s.visualDirection}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {proposal.hashtags.length > 0 ? (
                <p className="mt-3 text-[11px] text-white/50">
                  {proposal.hashtags.join(" ")}
                </p>
              ) : null}
              {proposal.cta ? (
                <p className="mt-2 text-xs text-white/65">
                  <span className="text-white/40">CTA :</span> {proposal.cta}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Affiche le message sans le bloc ```json…``` pour alléger la lecture (le JSON reste dans Copier via parse). */
function stripJsonFenceForDisplay(text: string): string {
  return text.replace(/```(?:json)?\s*[\s\S]*?```/gi, "« JSON du concept (voir panneau Proposition ou réponse brute) »");
}
