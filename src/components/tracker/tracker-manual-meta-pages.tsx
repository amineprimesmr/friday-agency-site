"use client";

import { useCallback, useMemo, useState } from "react";

const STORAGE_PREFIX = "tracker_manual_meta_pages_v1:";

function storageKey(appId: string): string {
  return `${STORAGE_PREFIX}${appId}`;
}

/** Charge les IDs depuis localStorage — idempotent avec appId vide. */
export function loadStoredManualMetaPageIds(appId: string): string[] {
  if (!appId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(appId));
    if (!raw?.trim()) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s))
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function persistManualMetaPageIds(appId: string, ids: string[]): void {
  if (!appId || typeof window === "undefined") return;
  try {
    const clean = [...new Set(ids.map((s) => s.trim()).filter((s) => /^\d+$/.test(s)))].slice(0, 10);
    window.localStorage.setItem(storageKey(appId), JSON.stringify(clean));
  } catch {
    /* noop */
  }
}

type ResolveResponse = {
  configured?: boolean;
  pageIds?: string[];
  pageDetails?: { pageId: string; pageName?: string }[];
  failures?: { fragment: string; reason: string }[];
  error?: string | null;
};

export function TrackerManualMetaPagesPanel({
  trackerAppleAppId,
  manualPageIds,
  onManualPageIdsChange,
  configured,
}: {
  trackerAppleAppId: string;
  manualPageIds: string[];
  onManualPageIdsChange: (ids: string[]) => void;
  /** Token Meta configuré sur le projet (pour activer résolution slug). */
  configured: boolean;
}) {
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastFailures, setLastFailures] = useState<{ fragment: string; reason: string }[]>([]);

  const canUse = trackerAppleAppId.length > 0;

  const removeId = useCallback(
    (id: string) => {
      const next = manualPageIds.filter((x) => x !== id);
      onManualPageIdsChange(next);
      persistManualMetaPageIds(trackerAppleAppId, next);
    },
    [manualPageIds, onManualPageIdsChange, trackerAppleAppId],
  );

  const clearAll = useCallback(() => {
    onManualPageIdsChange([]);
    persistManualMetaPageIds(trackerAppleAppId, []);
    setLastError(null);
    setLastFailures([]);
  }, [onManualPageIdsChange, trackerAppleAppId]);

  const resolveAndMerge = useCallback(async () => {
    if (!pasteText.trim() || !configured) return;
    setBusy(true);
    setLastError(null);
    setLastFailures([]);
    try {
      const res = await fetch("/api/meta/resolve-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const json = (await res.json()) as ResolveResponse;
      if (!res.ok || json.error) {
        setLastError(json.error ?? "Erreur API");
        setLastFailures([]);
        return;
      }
      const newIds = (json.pageIds ?? []).slice(0, 10);

      const merged = [...new Set([...manualPageIds, ...newIds])].slice(0, 10);
      onManualPageIdsChange(merged);
      persistManualMetaPageIds(trackerAppleAppId, merged);

      if (newIds.length > 0) {
        setPasteText("");
        setLastFailures([]);
      } else if (json.failures?.length) {
        setLastFailures(json.failures.slice(0, 8));
      }
    } catch {
      setLastError("Réseau indisponible");
    } finally {
      setBusy(false);
    }
  }, [pasteText, configured, manualPageIds, onManualPageIdsChange, trackerAppleAppId]);

  const hints = useMemo(
    () => [
      "Collez une URL Ad Library contenant « view_all_page_id=… ».",
      "Ou plusieurs IDs Page (10 à 17 chiffres), un par ligne.",
    ],
    [],
  );

  if (!canUse) return null;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
        Pages Meta manuelles
      </h3>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/55">
        Si la résolution auto ne trouve pas la bonne Page (Instagram ≠ slug Facebook),
        ajoute les <strong className="text-white/78">IDs Page officiels</strong> — par ex. depuis la Bibliothèque
        Meta (paramètre <code className="rounded bg-white/[0.08] px-1 text-[10px]">view_all_page_id</code>). Stocké
        pour cette app uniquement ({trackerAppleAppId}).
      </p>

      {!configured ? (
        <p className="mt-3 text-xs font-medium text-amber-300/90">
          Variable <code className="rounded bg-black/30 px-1">META_AD_LIBRARY_ACCESS_TOKEN</code> absente&nbsp;: la résolution à
          partir d&apos;URL est désactivée — colle tout de même des IDs Page numériques ci-dessous (un par ligne) puis «
          Enregistrer ».
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <label htmlFor={`manual-meta-paste-${trackerAppleAppId}`} className="sr-only">
          URLs ou IDs Meta
        </label>
        <textarea
          id={`manual-meta-paste-${trackerAppleAppId}`}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={3}
          placeholder="https://…facebook.com/ads/library/…view_all_page_id=123456789…"
          className="w-full resize-y rounded-xl border border-white/[0.1] bg-black/25 px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-amber-500/35"
          disabled={busy}
        />

        {!configured ? (
          <button
            type="button"
            onClick={() => {
              const lines = pasteText.split(/[\r\n,;\s]+/).map((s) => s.trim());
              const loose = [...new Set([...manualPageIds, ...lines.filter((x) => /^\d+$/.test(x))])].slice(0, 10);
              onManualPageIdsChange(loose);
              persistManualMetaPageIds(trackerAppleAppId, loose);
              if (loose.length > manualPageIds.length) setPasteText("");
            }}
            disabled={busy}
            className="rounded-xl bg-white/[0.1] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/[0.14]"
          >
            Enregistrer les IDs uniquement (sans résolution slug)
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void resolveAndMerge()}
            disabled={busy || !pasteText.trim()}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Résolution…" : "Résoudre et ajouter"}
          </button>
        )}
      </div>

      <ul className="mt-3 space-y-0.5 text-[11px] text-white/42">
        {hints.map((h) => (
          <li key={h}>• {h}</li>
        ))}
      </ul>

      {lastError ? <p className="mt-2 text-xs font-medium text-rose-300">{lastError}</p> : null}
      {lastFailures.length ? (
        <div className="mt-3 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[11px] text-white/45">
          <p className="font-semibold text-white/68">Fragments non résolus</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {lastFailures.map((f) => (
              <li key={`${f.fragment}-${f.reason}`}>
                <span className="text-white/62">{f.fragment.slice(0, 120)}</span> — {f.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {manualPageIds.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Ajoutées ({manualPageIds.length})
          </span>
          {manualPageIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] py-1 pl-2 pr-1 text-[12px] text-white/80"
            >
              <span className="tabular-nums">{id}</span>
              <button
                type="button"
                aria-label={`Retirer ${id}`}
                onClick={() => removeId(id)}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/15"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-[11px] font-semibold text-rose-300/90 underline-offset-4 hover:underline"
          >
            Tout effacer
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[11px] text-white/35">Aucune page manuelle enregistrée pour cette app.</p>
      )}
    </div>
  );
}
