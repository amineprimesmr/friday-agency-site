"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";
import type { TrackappClonePromptBundle } from "@/lib/trackapp-clone-prompt";
import {
  readPreferredIde,
  writePreferredIde,
} from "@/lib/trackapp-clone-prompt/preferences";
import type { TrackappCloneAngle, TrackappCloneStack, TrackappPreferredIde } from "@/lib/trackapp-clone-prompt/types";

type Toast = { message: string } | null;

function openExternalUrl(url: string) {
  window.location.href = url;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type TrackappCloneAppActionsProps = Readonly<{
  initialBundle: TrackappClonePromptBundle;
  appId: string;
  country: string;
  initialStack: TrackappCloneStack;
  initialAngle: TrackappCloneAngle;
  artworkUrl?: string | null;
  artistName?: string;
  compact?: boolean;
  autoOpenIde?: "cursor" | "claude" | null;
}>;

const STACK_OPTIONS: ReadonlyArray<{ id: TrackappCloneStack; title: string; desc: string }> = [
  { id: "swiftui", title: "SwiftUI + Xcode", desc: "Natif iOS, idéal App Store et perfs." },
  { id: "expo", title: "Expo", desc: "React Native rapide, EAS Build." },
  { id: "react-native", title: "React Native", desc: "Contrôle natif maximal." },
];

const ANGLE_OPTIONS: ReadonlyArray<{ id: TrackappCloneAngle; title: string; desc: string }> = [
  { id: "inspire", title: "S'inspirer", desc: "Même problème, marque et design originaux." },
  { id: "niche-adjacent", title: "Niche adjacente", desc: "Cible plus étroite ou marché voisin." },
  { id: "premium-simple", title: "Premium simple", desc: "Moins de features, exécution supérieure." },
];

export function TrackappCloneAppActions({
  initialBundle,
  appId,
  country,
  initialStack,
  initialAngle,
  artworkUrl,
  artistName,
  compact = false,
  autoOpenIde = null,
}: TrackappCloneAppActionsProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const [stack, setStack] = useState(initialStack);
  const [angle, setAngle] = useState(initialAngle);
  const [preferredIde, setPreferredIde] = useState<TrackappPreferredIde>("cursor");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [showFullPrompt, setShowFullPrompt] = useState(!compact);

  useEffect(() => {
    setPreferredIde(readPreferredIde());
  }, []);

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!autoOpenIde || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    writePreferredIde(autoOpenIde);
    setPreferredIde(autoOpenIde);
    const link = autoOpenIde === "claude" ? bundle.claudeDeeplink : bundle.cursorDeeplink;
    window.location.href = link;
  }, [autoOpenIde, bundle.claudeDeeplink, bundle.cursorDeeplink]);

  const showToast = useCallback((message: string) => {
    setToast({ message });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const refreshBundle = useCallback(
    async (nextStack: TrackappCloneStack, nextAngle: TrackappCloneAngle) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ appId, country, stack: nextStack, angle: nextAngle });
        const res = await fetch(`/api/trackapp/clone-prompt?${params.toString()}`);
        if (!res.ok) throw new Error("refresh failed");
        const data = (await res.json()) as TrackappClonePromptBundle;
        setBundle(data);
        const url = new URL(window.location.href);
        url.searchParams.set("stack", nextStack);
        url.searchParams.set("angle", nextAngle);
        window.history.replaceState(null, "", url.toString());
      } catch {
        showToast("Erreur lors de la mise à jour de la spec");
      } finally {
        setLoading(false);
      }
    },
    [appId, country, showToast],
  );

  const primaryDeeplink = useMemo(
    () => (preferredIde === "claude" ? bundle.claudeDeeplink : bundle.cursorDeeplink),
    [preferredIde, bundle.claudeDeeplink, bundle.cursorDeeplink],
  );

  const openPrimaryIde = () => {
    openExternalUrl(primaryDeeplink);
    showToast(
      preferredIde === "cursor"
        ? "Cursor devrait s'ouvrir — valide le prompt avant envoi"
        : "Claude Code devrait s'ouvrir — valide le prompt avant envoi",
    );
  };

  const onCopyFull = async () => {
    const ok = await copyText(bundle.fullPrompt);
    showToast(ok ? "Spec complète copiée" : "Copie impossible");
  };

  const onCopyDeeplink = async () => {
    const ok = await copyText(bundle.deeplinkPrompt);
    showToast(ok ? "Prompt court copié" : "Copie impossible");
  };

  const onDownload = () => {
    downloadMarkdown(bundle.markdownFilename, bundle.fullPrompt);
    showToast("Fichier .md téléchargé");
  };

  const onStackChange = (next: TrackappCloneStack) => {
    setStack(next);
    void refreshBundle(next, angle);
  };

  const onAngleChange = (next: TrackappCloneAngle) => {
    setAngle(next);
    void refreshBundle(stack, next);
  };

  const onIdeChange = (ide: TrackappPreferredIde) => {
    setPreferredIde(ide);
    writePreferredIde(ide);
  };

  return (
    <>
      {!compact ? (
        <header className="trackapp-clone-hero p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artworkUrl}
                alt=""
                className="h-24 w-24 shrink-0 rounded-[22px] bg-white/10 object-cover ring-1 ring-white/15"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="trackapp-clone-hero-kicker m-0">appLAB</p>
              <h1 className="m-0 mt-2 text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-tight tracking-tight">
                {bundle.appName}
              </h1>
              {artistName ? (
                <p className="mt-2 text-[0.95rem] font-semibold text-white/65">{artistName}</p>
              ) : null}
              <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-white/70">
                Spec produit + prompts Cursor / Claude Code. Rien ne part sans votre validation dans l&apos;IDE.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={trackappAccueilAppHref(appId, country)}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/20 bg-white/10 px-4 text-[0.82rem] font-bold text-white no-underline hover:bg-white/15"
                >
                  ← Fiche app
                </Link>
                <a
                  href={bundle.appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-white/20 bg-white/10 px-4 text-[0.82rem] font-bold text-white no-underline hover:bg-white/15"
                >
                  App Store ↗
                </a>
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <section className={compact ? "" : "mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"}>
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
            <h2 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Outil IA préféré</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={`trackapp-clone-ide-btn trackapp-clone-ide-btn--cursor ${preferredIde === "cursor" ? "ring-2 ring-slate-900 ring-offset-2" : "opacity-70"}`}
                onClick={() => onIdeChange("cursor")}
              >
                Cursor
              </button>
              <button
                type="button"
                className={`trackapp-clone-ide-btn trackapp-clone-ide-btn--claude ${preferredIde === "claude" ? "ring-2 ring-amber-900 ring-offset-2" : "opacity-70"}`}
                onClick={() => onIdeChange("claude")}
              >
                Claude Code
              </button>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
            <h2 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Stack</h2>
            <div className="mt-3 grid gap-2">
              {STACK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-active={stack === opt.id}
                  className="trackapp-clone-option"
                  disabled={loading}
                  onClick={() => onStackChange(opt.id)}
                >
                  <span className="trackapp-clone-option-title">{opt.title}</span>
                  <span className="trackapp-clone-option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
            <h2 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Angle produit</h2>
            <div className="mt-3 grid gap-2">
              {ANGLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-active={angle === opt.id}
                  className="trackapp-clone-option"
                  disabled={loading}
                  onClick={() => onAngleChange(opt.id)}
                >
                  <span className="trackapp-clone-option-title">{opt.title}</span>
                  <span className="trackapp-clone-option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
            <h2 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Lancer dans l&apos;IDE</h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--dash-muted-light)]">
              Résumé + lien vers cette page ({bundle.fullPrompt.length.toLocaleString("fr-FR")} caractères au total).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={
                  preferredIde === "cursor"
                    ? "trackapp-clone-ide-btn trackapp-clone-ide-btn--cursor"
                    : "trackapp-clone-ide-btn trackapp-clone-ide-btn--claude"
                }
                disabled={loading}
                onClick={openPrimaryIde}
              >
                Ouvrir dans {preferredIde === "cursor" ? "Cursor" : "Claude Code"}
              </button>
              {preferredIde === "cursor" ? (
                <button
                  type="button"
                  className="trackapp-clone-ide-btn trackapp-clone-ide-btn--ghost"
                  disabled={loading}
                  onClick={() => {
                    openExternalUrl(bundle.cursorWebDeeplink);
                    showToast("Lien web Cursor");
                  }}
                >
                  Cursor (web)
                </button>
              ) : null}
              <button type="button" className="trackapp-clone-ide-btn trackapp-clone-ide-btn--ghost" disabled={loading} onClick={onCopyFull}>
                Copier toute la spec
              </button>
              <button type="button" className="trackapp-clone-ide-btn trackapp-clone-ide-btn--ghost" disabled={loading} onClick={onDownload}>
                Télécharger .md
              </button>
            </div>
            {loading ? <p className="mt-3 text-[0.8rem] font-semibold text-slate-500">Mise à jour…</p> : null}
          </div>

          <div className="rounded-[22px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Aperçu du prompt</h2>
              <button type="button" className="text-[0.8rem] font-bold text-slate-600 underline-offset-2 hover:underline" onClick={() => setShowFullPrompt((v) => !v)}>
                {showFullPrompt ? "Version courte" : "Spec complète"}
              </button>
            </div>
            <pre className="trackapp-clone-prompt-preview mt-3" aria-label="Aperçu prompt">
              {showFullPrompt ? bundle.fullPrompt : bundle.deeplinkPrompt}
            </pre>
            <button type="button" className="mt-3 text-[0.8rem] font-bold text-slate-600 underline-offset-2 hover:underline" onClick={onCopyDeeplink}>
              Copier le prompt court
            </button>
          </div>

          <p className="text-[0.8rem] leading-relaxed text-[var(--dash-muted-light)]">
            Inspiration originale uniquement — pas de copie de marque, logo ou textes App Store.
          </p>
        </div>
      </section>

      {toast ? (
        <div className="trackapp-clone-toast" role="status">
          {toast.message}
        </div>
      ) : null}
    </>
  );
}
