"use client";

import { readApiJson } from "@/lib/read-api-json";
import { requestAvatarImageGeneration } from "@/lib/avatar-image-client";
import {
  ASPECT_OPTIONS,
  type ImageStudioAspectId,
  type ImageStudioQualityUi,
  IMAGE_MODELS,
  buildImageStudioPrompt,
  creditHintPerImage,
  euroPerImage,
  formatEuro,
  openaiGenerationSizeForAspect,
  qualityToApi,
} from "@/lib/image-studio-mapping";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const MAX_REFERENCE_UPLOADS = 8;
/** Higgsfield-aligned accents */
const LIME = "#ccff00";
const PANEL_BG = "#1a1a1a";
const PAGE_BG = "#0d0d0d";
const BORDER_SUBTLE = "#2d2d2d";
const HEADER_BG = "#000000";
const NAV_MUTED = "rgba(255,255,255,0.45)";

/** Qualité et résolution fixes (plus de sélecteurs UI). */
const FIXED_QUALITY: ImageStudioQualityUi = "high";
const FIXED_RESOLUTION = "2k" as const;

type RefSlot = { id: string; preview: string; fileId: string };
type GalleryItem = {
  id: string;
  url: string | null;
  prompt: string;
  at: number;
  pending: boolean;
};

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = r.result as string;
      const comma = dataUrl.indexOf(",");
      resolve({
        base64: dataUrl.slice(comma + 1),
        mimeType: file.type || "image/jpeg",
      });
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function galleryMediaClass(aspectId: ImageStudioAspectId): string {
  switch (aspectId) {
    case "16:9":
    case "21:9":
    case "3:2":
      return "aspect-video w-full object-cover sm:max-h-[380px]";
    case "1:1":
    case "auto":
    case "4:3":
      return "aspect-square w-full object-cover sm:aspect-auto sm:max-h-[520px]";
    default:
      return "aspect-[9/16] w-full object-cover sm:aspect-auto sm:max-h-[520px]";
  }
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconDiamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M12 2L2 7l10 20 10-20L12 2z" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconCheckSmall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icônes du menu « Aspect ratio » (repères visuels type Higgsfield). */
function AspectGlyph({ id, className: iconClass }: { id: ImageStudioAspectId; className?: string }) {
  const c = iconClass ?? "h-4 w-4";
  switch (id) {
    case "auto":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <path d="M4 8V4h4M16 4h4v4M4 16v4h4M20 16v4h-4" strokeLinecap="round" />
        </svg>
      );
    case "1:1":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="5" y="5" width="14" height="14" rx="2.5" />
        </svg>
      );
    case "3:2":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="3" y="7" width="18" height="10" rx="1.5" />
        </svg>
      );
    case "2:3":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="8" y="3" width="8" height="18" rx="1.5" />
        </svg>
      );
    case "16:9":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="2" y="8" width="20" height="8" rx="1.5" />
        </svg>
      );
    case "9:16":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="8" y="2" width="8" height="20" rx="1.5" />
        </svg>
      );
    case "4:3":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="4" y="7" width="16" height="10" rx="1.5" />
        </svg>
      );
    case "3:4":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="7" y="4" width="10" height="16" rx="1.5" />
        </svg>
      );
    case "21:9":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="1" y="9" width="22" height="6" rx="1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={c} aria-hidden>
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
      );
  }
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l1.2 4.2L17 7.3l-3.8 2.5L14.5 14 12 11.8 9.5 14l1.3-4.2L7 7.3l3.8-1.1L12 2z" />
    </svg>
  );
}

function HiggsfieldHeroEmpty() {
  const cards = [
    {
      gradient: "bg-gradient-to-b from-emerald-800/90 via-green-950/70 to-[#0a0a0a]",
      rot: "-rotate-6 -translate-y-2",
      glow: "shadow-[0_0_48px_-8px_rgba(34,197,94,0.35)]",
    },
    {
      gradient: "bg-gradient-to-b from-amber-700/80 via-orange-900/50 to-[#0a0a0a]",
      rot: "-rotate-2 translate-y-1",
      glow: "shadow-[0_0_42px_-8px_rgba(251,191,36,0.25)]",
    },
    {
      gradient: "bg-gradient-to-b from-blue-500/50 via-indigo-900/70 to-[#0a0a0a]",
      rot: "rotate-1 translate-y-0",
      glow: "shadow-[0_0_48px_-6px_rgba(59,130,246,0.35)]",
    },
    {
      gradient: "bg-gradient-to-b from-zinc-200/35 via-zinc-500/25 to-zinc-900/90",
      rot: "rotate-6 -translate-y-1",
      glow: "shadow-[0_0_40px_-8px_rgba(212,212,216,0.2)]",
    },
  ];

  return (
    <div className="relative flex min-h-[min(58vh,480px)] flex-col items-center justify-end overflow-hidden px-4 pb-16 pt-8 sm:pb-20">
      <div className="absolute inset-x-0 top-[12%] z-0 flex justify-center sm:top-[10%]">
        <div className="flex h-[min(220px,28vh)] items-end justify-center gap-1.5 sm:h-[min(260px,32vh)] sm:gap-2 md:h-[300px]">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.05 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative h-[92%] w-[56px] shrink-0 rounded-2xl ring-1 ring-white/[0.12] sm:w-[72px] md:w-[88px]",
                c.gradient,
                c.rot,
                c.glow,
              )}
              style={{ zIndex: 10 - i }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50 sm:text-xs">
          Start creating with
        </p>
        <h1
          className="mt-3 text-[1.65rem] font-bold uppercase leading-none tracking-tight sm:text-4xl md:text-[2.75rem]"
          style={{ color: LIME, textShadow: "0 0 42px rgba(204,255,0,0.22)" }}
        >
          GPT Image 2
        </h1>
        <p className="mx-auto mt-4 max-w-[22rem] text-[13px] leading-relaxed text-white/38 sm:max-w-lg sm:text-[15px]">
          Describe a scene, character, mood, or style — and watch it come to life
        </p>
      </div>
    </div>
  );
}

export function HiggsfieldImageStudio() {
  const reduceMotion = useReducedMotion();
  const [refs, setRefs] = useState<RefSlot[]>([]);
  const [prompt, setPrompt] = useState("");
  const [aspectId, setAspectId] = useState<ImageStudioAspectId>("9:16");
  const [quantity, setQuantity] = useState(1);
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gridZoom, setGridZoom] = useState(48);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const aspect = ASPECT_OPTIONS.find((a) => a.id === aspectId) ?? ASPECT_OPTIONS[0];
  const openaiSize = openaiGenerationSizeForAspect(aspectId);

  const selectedModel = IMAGE_MODELS[0];
  const creditEach = creditHintPerImage(FIXED_QUALITY);
  const totalCreditsHint = creditEach * quantity;
  const eurEach = euroPerImage(FIXED_QUALITY, FIXED_RESOLUTION);
  const totalEurHint = Math.round(eurEach * quantity * 100) / 100;

  useEffect(() => {
    if (!modelOpen && !ratioOpen) return;
    function onDocDown(e: MouseEvent) {
      const el = panelRef.current;
      if (el && !el.contains(e.target as Node)) {
        setModelOpen(false);
        setRatioOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [modelOpen, ratioOpen]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const additions: RefSlot[] = [];
    const maxNew = Math.max(0, MAX_REFERENCE_UPLOADS - refs.length);
    if (maxNew <= 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (additions.length >= maxNew) break;
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const res = await fetch("/api/avatar/upload-reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        const data = await readApiJson<{ fileId?: string; error?: string }>(res);
        if (!res.ok || !data.fileId) throw new Error(data.error ?? "Upload échoué");
        const url = URL.createObjectURL(file);
        additions.push({ id: newId(), preview: url, fileId: data.fileId });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return;
      }
    }
    if (additions.length) {
      setRefs((prev) => [...prev, ...additions].slice(0, MAX_REFERENCE_UPLOADS));
    }
  }

  function removeRef(id: string) {
    setRefs((r) => {
      const x = r.find((i) => i.id === id);
      if (x?.preview.startsWith("blob:")) URL.revokeObjectURL(x.preview);
      return r.filter((i) => i.id !== id);
    });
  }

  async function handleGenerate() {
    const raw = prompt.trim();
    if (!raw) {
      setError("Add a description in the field above, then tap Generate.");
      return;
    }
    const fileIds = refs.map((r) => r.fileId);
    const composedPrompt = buildImageStudioPrompt(raw, fileIds.length);
    const slotIds = Array.from({ length: quantity }, () => newId());
    setGenerating(true);
    setError(null);

    setGallery((g) => [
      ...slotIds.map(
        (id): GalleryItem => ({
          id,
          url: null,
          prompt: raw,
          at: Date.now(),
          pending: true,
        }),
      ),
      ...g,
    ]);

    const qApi = qualityToApi(FIXED_QUALITY);
    try {
      for (let i = 0; i < quantity; i++) {
        const sid = slotIds[i];
        const { imageUrl } = await requestAvatarImageGeneration(composedPrompt, fileIds, {
          size: openaiSize,
          quality: qApi,
        });
        setGallery((g) =>
          g.map((item) =>
            item.id === sid
              ? { ...item, url: imageUrl, pending: false, at: Date.now() }
              : item,
          ),
        );
      }
    } catch (e) {
      setGallery((g) => g.filter((item) => !slotIds.includes(item.id)));
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  }

  const doneCount = gallery.filter((i) => i.url && !i.pending).length;
  const inFlightCount = gallery.filter((i) => i.pending).length;

  const gridColClass =
    gridZoom < 28
      ? "grid-cols-1"
      : gridZoom < 48
        ? "grid-cols-1 sm:grid-cols-2"
        : gridZoom < 72
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="min-h-dvh text-white antialiased" style={{ backgroundColor: PAGE_BG }}>
      <header
        className="sticky top-0 z-40 border-b px-3 py-2.5 sm:px-4"
        style={{ backgroundColor: HEADER_BG, borderColor: BORDER_SUBTLE }}
      >
        <div className="mx-auto flex max-w-[1760px] flex-wrap items-center gap-2 gap-y-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial lg:gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[15px] font-bold text-black">
              F
            </span>
            <nav className="hidden items-center gap-0.5 text-[13px] font-medium lg:flex">
              <Link
                href="/tracker"
                className="rounded-lg px-3 py-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/90"
                style={{ color: NAV_MUTED }}
              >
                Explore
              </Link>
              <span
                className="rounded-lg px-3 py-2 text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                Image
              </span>
              <Link
                href="/avatar"
                className="rounded-lg px-3 py-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Avatar
              </Link>
              <Link
                href="/avatar/carousel"
                className="rounded-lg px-3 py-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/90"
              >
                Carrousel
              </Link>
            </nav>
          </div>

          <div className="order-last flex w-full min-w-[200px] flex-1 px-0 sm:order-none sm:max-w-md sm:px-2">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-full border px-4 py-2 text-left text-[13px] transition-colors hover:border-white/20"
              style={{
                borderColor: BORDER_SUBTLE,
                backgroundColor: "#141414",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              <IconSearch className="h-4 w-4 shrink-0 opacity-50" />
              <span>Search</span>
              <kbd className="ml-auto hidden font-sans text-[10px] text-white/25 sm:inline">⌘ K</kbd>
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative hidden flex-col items-center gap-0.5 rounded-xl border px-3 py-2 sm:flex"
              style={{ borderColor: BORDER_SUBTLE, backgroundColor: "#141414" }}
            >
              <div className="flex items-center gap-2">
                <IconDiamond className="h-3.5 w-3.5 text-white/70" />
                <span className="text-[10px] font-semibold leading-none text-pink-400">30% OFF</span>
              </div>
            </button>
            <Link
              href="/trackapp/connexion"
              className="hidden text-sm font-semibold sm:inline"
              style={{ color: LIME }}
            >
              Log in
            </Link>
            <Link
              href="/trackapp/inscription"
              className="rounded-full px-4 py-2 text-sm font-semibold text-black transition-[filter] hover:brightness-110"
              style={{ backgroundColor: LIME }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <nav
        className="flex items-center gap-1 overflow-x-auto border-b px-3 py-2 text-[12px] font-medium lg:hidden"
        style={{ borderColor: BORDER_SUBTLE, backgroundColor: HEADER_BG }}
      >
        <Link href="/tracker" className="shrink-0 rounded-lg px-3 py-1.5 text-white/50">
          Explore
        </Link>
        <span className="shrink-0 rounded-lg px-3 py-1.5 text-white" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          Image
        </span>
        <Link href="/avatar" className="shrink-0 rounded-lg px-3 py-1.5 text-white/50">
          Avatar
        </Link>
        <Link href="/avatar/carousel" className="shrink-0 rounded-lg px-3 py-1.5 text-white/50">
          Carrousel
        </Link>
      </nav>

      <div
        className="flex items-center justify-between border-b px-4 py-2.5 text-xs"
        style={{ borderColor: BORDER_SUBTLE, color: "rgba(255,255,255,0.38)" }}
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-85"
            aria-hidden
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Historique
        </span>

        <div className="flex items-center gap-3">
          <span style={{ color: "rgba(255,255,255,0.22)" }}>
            {doneCount} rendu(s)
            {inFlightCount > 0 ? (
              <span className="font-medium" style={{ color: `${LIME}d0` }}>
                {" "}
                · {inFlightCount} en cours…
              </span>
            ) : null}
          </span>
          <div className="hidden h-1 w-[120px] cursor-pointer sm:block">
            <input
              type="range"
              min={0}
              max={100}
              value={gridZoom}
              onChange={(e) => setGridZoom(Number(e.target.value))}
              className="slider-thumb h-full w-full appearance-none bg-transparent"
              style={{ accentColor: LIME }}
              aria-label="Zoom de la grille"
            />
          </div>
        </div>
      </div>

      <main className={cn("grid gap-3 p-4 pb-[280px]", gallery.length > 0 ? gridColClass : "")}>
        {gallery.length === 0 ? (
          <div className="col-span-full">
            <HiggsfieldHeroEmpty />
          </div>
        ) : (
          gallery.map((item) =>
            item.pending || !item.url ? (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border bg-[#0c0c0c]"
                style={{ borderColor: `${LIME}40` }}
                aria-busy="true"
                aria-label="Génération d’image en cours"
              >
                <div
                  className={cn(
                    "relative flex w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-white/[0.07] to-black/50",
                    galleryMediaClass(aspectId),
                  )}
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundColor: `${LIME}08` }}
                    animate={reduceMotion ? {} : { opacity: [0.45, 0.9, 0.45] }}
                    transition={
                      reduceMotion ? {} : { duration: 1.35, repeat: Infinity, ease: "easeInOut" }
                    }
                  />
                  <motion.div
                    className="relative z-[1] h-11 w-11 rounded-full border-2 border-white/15"
                    style={{ borderTopColor: LIME }}
                    animate={reduceMotion ? {} : { rotate: 360 }}
                    transition={
                      reduceMotion ? {} : { duration: 0.85, repeat: Infinity, ease: "linear" }
                    }
                    aria-hidden
                  />
                  <p className="relative z-[1] max-w-[200px] px-3 text-center text-[11px] leading-snug text-white/50">
                    Creating…
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border bg-black/40"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className={galleryMediaClass(aspectId)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="absolute bottom-0 line-clamp-3 p-3 text-[11px] text-white/80">{item.prompt}</p>
                </div>
              </motion.div>
            ),
          )
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-5 sm:pb-6">
        <motion.div
          ref={panelRef}
          animate={
            generating
              ? {
                  boxShadow: `0 0 0 2px ${LIME}55, 0 28px 70px rgba(0,0,0,0.85)`,
                }
              : { boxShadow: "0 24px 64px rgba(0,0,0,0.72)" }
          }
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="pointer-events-auto w-full max-w-[960px] rounded-[1.75rem] border px-4 py-4 sm:px-5 sm:py-5"
          style={{ backgroundColor: PANEL_BG, borderColor: BORDER_SUBTLE }}
        >
          {/* Ligne 1 : vignettes + zone texte sans second fond (même surface #1a1a1a) */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">
              {refs.map((r) => (
                <div
                  key={r.id}
                  className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/12"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeRef(r.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/65 text-[11px] text-white opacity-0 transition hover:opacity-100"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <motion.button
                type="button"
                whileTap={reduceMotion ? {} : { scale: 0.94 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={refs.length >= MAX_REFERENCE_UPLOADS}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed text-lg transition-colors hover:border-white/35 disabled:opacity-30"
                style={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.35)" }}
              >
                +
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void addFiles(e.target.files)}
              />
            </div>

            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="Describe the scene you imagine"
              className="min-h-[5.25rem] w-full flex-1 resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed text-white placeholder:text-white/35 focus:outline-none focus:ring-0 sm:min-h-[5.75rem]"
            />
          </div>

          <AnimatePresence>
            {error ? (
              <motion.div
                key={error}
                role="alert"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mb-4 rounded-xl border px-4 py-3 text-sm text-red-100"
                style={{ borderColor: "rgba(248,113,113,0.35)", backgroundColor: "rgba(69,10,10,0.45)" }}
              >
                {error}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setModelOpen((o) => !o);
                  setRatioOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border px-2.5 py-1.5 pr-3 text-left text-[13px] font-medium text-white/90"
                style={{ borderColor: BORDER_SUBTLE, backgroundColor: "rgba(255,255,255,0.07)" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-black"
                  style={{ backgroundColor: LIME }}
                >
                  G
                </span>
                <span className="max-w-[10rem] truncate">{selectedModel.label}</span>
                <IconChevronRight className="ml-0.5 h-4 w-4 shrink-0 text-white/35" />
              </button>
              {modelOpen ? (
                <div
                  className="absolute bottom-full left-0 z-10 mb-2 w-72 max-h-64 overflow-y-auto rounded-2xl border py-1 shadow-2xl"
                  style={{ borderColor: BORDER_SUBTLE, backgroundColor: "#141414" }}
                >
                  {IMAGE_MODELS.map((m) => (
                    <div
                      key={m.label}
                      className={`px-3 py-2 text-xs ${m.enabled ? "text-white" : "text-white/35"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{m.label}</span>
                        {m.badge ? (
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px]"
                            style={{ backgroundColor: `${LIME}28`, color: LIME }}
                          >
                            {m.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[10px] text-white/40">{m.description}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setRatioOpen((o) => !o);
                  setModelOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-medium text-white/90"
                style={{ borderColor: BORDER_SUBTLE, backgroundColor: "rgba(255,255,255,0.07)" }}
              >
                <span className="flex h-7 w-7 items-center justify-center text-white/65">
                  <AspectGlyph id={aspectId} className="h-4 w-4" />
                </span>
                {aspect.label}
                <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-white/35" />
              </button>
              {ratioOpen ? (
                <div
                  className="absolute bottom-full left-0 z-10 mb-2 w-[min(calc(100vw-2rem),268px)] overflow-hidden rounded-2xl border shadow-2xl"
                  style={{ borderColor: BORDER_SUBTLE, backgroundColor: "#1a1a1a" }}
                >
                  <p
                    className="border-b px-3.5 py-2.5 text-[11px] font-medium text-white/45"
                    style={{ borderColor: BORDER_SUBTLE }}
                  >
                    Aspect ratio
                  </p>
                  <div className="max-h-[min(50vh,340px)] overflow-y-auto py-1">
                    {ASPECT_OPTIONS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setAspectId(a.id);
                          setRatioOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] transition-colors",
                          aspectId === a.id
                            ? "bg-white/[0.1] text-white"
                            : "text-white/65 hover:bg-white/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            aspectId === a.id ? "bg-white/[0.12]" : "bg-white/[0.06]",
                          )}
                        >
                          <AspectGlyph id={a.id} className="h-[17px] w-[17px]" />
                        </span>
                        <span className="min-w-0 flex-1 font-medium">{a.label}</span>
                        {aspectId === a.id ? (
                          <span style={{ color: LIME }}>
                            <IconCheckSmall className="h-4 w-4 shrink-0" />
                          </span>
                        ) : (
                          <span className="w-4 shrink-0" aria-hidden />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="flex items-center gap-0.5 rounded-full border px-0.5 text-[13px] font-medium tabular-nums"
              style={{ borderColor: BORDER_SUBTLE, backgroundColor: "rgba(255,255,255,0.07)" }}
            >
              <motion.button
                type="button"
                whileTap={reduceMotion ? {} : { scale: 0.92 }}
                className="px-2.5 py-2 text-white/45 transition-colors hover:text-white"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </motion.button>
              <span className="min-w-[2.85rem] text-center text-white/88">{quantity}/4</span>
              <motion.button
                type="button"
                whileTap={reduceMotion ? {} : { scale: 0.92 }}
                className="px-2.5 py-2 text-white/45 transition-colors hover:text-white"
                onClick={() => setQuantity((q) => Math.min(4, q + 1))}
              >
                +
              </motion.button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <motion.button
                type="button"
                disabled={generating}
                whileTap={reduceMotion || generating ? {} : { scale: 0.97 }}
                onClick={() => void handleGenerate()}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-black shadow-md transition-[filter] hover:brightness-95 disabled:opacity-45"
                style={{ backgroundColor: LIME, boxShadow: `0 4px 24px ${LIME}40` }}
              >
                <span className="tracking-tight">{generating ? "Generating…" : "Generate"}</span>
                <IconSparkle className="h-4 w-4 text-black/80" />
                <span className="flex items-center gap-1 rounded-lg bg-black/15 px-2 py-0.5 text-xs tabular-nums font-bold">
                  <span className="opacity-85">~{formatEuro(totalEurHint)}</span>
                  <span className="text-[10px] opacity-75">{totalCreditsHint}</span>
                </span>
              </motion.button>
            </div>
          </div>

          {!error ? (
            <p className="mt-3 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>
              gpt-image-2 · {openaiSize} · {qualityToApi(FIXED_QUALITY)} ·{" "}
              {refs.length > 0 ? `${refs.length} ref` : "no ref"}
            </p>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
