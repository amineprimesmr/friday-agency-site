"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { buildEmbedCountriesIframeSrc } from "@/lib/embed-url";

type ThemePick = "system" | "dark" | "light";
type ViewPick = "list" | "globe";

interface Props {
  appId: string;
  appName: string;
}

export function EmbedCountriesModalTrigger({ appId, appName }: Props) {
  const dialogId = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<ThemePick>("system");
  const [view, setView] = useState<ViewPick>("globe");

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", onEsc);
      return () => window.removeEventListener("keydown", onEsc);
    }
    return undefined;
  }, [open]);

  const iframeSrc = useMemo(() => buildEmbedCountriesIframeSrc(appId, { theme, view }), [appId, theme, view]);

  const snippet = useMemo(() => {
    const escTitle = `${appName} — Trackapp · classements pays`
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
    return `<iframe
  src="${iframeSrc}"
  title="${escTitle}"
  width="100%"
  height="480"
  style="border:0;border-radius:12px;background:transparent;max-width:100%;min-height:420px;display:block;"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>`;
  }, [iframeSrc, appName]);

  const copySnippet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }, [snippet]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${dialogId}-embed-dialog`}
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-xl border border-white/14 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/26 hover:bg-white/[0.1] hover:text-white"
      >
        Intégrer
      </button>

      {open ? (
        <div className="fixed inset-0 z-[220] flex items-end justify-center p-3 sm:items-center" role="presentation">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            id={`${dialogId}-embed-dialog`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-embed-heading`}
            className="relative z-10 mt-auto w-full max-w-lg rounded-2xl border border-white/12 bg-neutral-950 p-5 shadow-2xl sm:mt-0"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id={`${dialogId}-embed-heading`} className="text-lg font-semibold text-white">
                  Intégrer les classements par pays
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-white/42">
                  Collez ce bloc pour afficher la liste des classements (vue synthèse ou tableau). Avec «&nbsp;système&nbsp;», fond clair ou sombre selon l’appareil du visiteur.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer la fenêtre"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-lg p-1 text-lg leading-none text-white/45 hover:bg-white/[0.08] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-5">
              <fieldset className="min-w-[9rem] space-y-1.5">
                <legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/35">Thème</legend>
                {(
                  [
                    { id: "sys", label: "Auto", val: "system" as ThemePick },
                    { id: "dk", label: "Sombre", val: "dark" as ThemePick },
                    { id: "lt", label: "Clair", val: "light" as ThemePick },
                  ] as const
                ).map((o) => (
                  <label key={o.val} className="flex cursor-pointer items-center gap-2 text-[13px] text-white/70">
                    <input
                      type="radio"
                      name={`${dialogId}-theme`}
                      checked={theme === o.val}
                      onChange={() => setTheme(o.val)}
                      className="border-white/20 bg-white/[0.04] accent-emerald-400"
                    />
                    {o.label}
                  </label>
                ))}
              </fieldset>

              <fieldset className="min-w-[9rem] space-y-1.5">
                <legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/35">Vue</legend>
                {(
                  [
                    { label: "Globe + tableau", val: "globe" as ViewPick },
                    { label: "Tableau uniquement", val: "list" as ViewPick },
                  ] as const
                ).map((o) => (
                  <label key={o.val} className="flex cursor-pointer items-center gap-2 text-[13px] text-white/70">
                    <input
                      type="radio"
                      name={`${dialogId}-view`}
                      checked={view === o.val}
                      onChange={() => setView(o.val)}
                      className="border-white/20 bg-white/[0.04] accent-emerald-400"
                    />
                    {o.label}
                  </label>
                ))}
              </fieldset>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
              <div className="border-b border-white/[0.06] px-3 py-1.5 text-[10px] text-white/30">Prévisualisation</div>
              <iframe src={iframeSrc} title={`Aperçu embed ${appName}`} className="h-[264px] w-full bg-transparent" />
            </div>

            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-white/35" htmlFor={`${dialogId}-code`}>
              Code à coller
            </label>
            <textarea
              id={`${dialogId}-code`}
              readOnly
              rows={6}
              value={snippet}
              className="mb-4 w-full resize-y rounded-xl border border-white/[0.1] bg-black/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-emerald-100/90 outline-none ring-0 focus-visible:border-emerald-500/40"
            />

            <button
              type="button"
              onClick={copySnippet}
              className="w-full rounded-xl bg-white py-3 text-sm font-bold text-neutral-950 transition hover:bg-white/90"
            >
              {copied ? "Copié dans le presse-papiers" : "Copier le code iframe"}
            </button>
            <p className="mt-3 text-center text-[11px] text-white/32" aria-live="polite">
              L’iframe ouvre uniquement une page Trackapp dédiée, sans votre header tracker.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
