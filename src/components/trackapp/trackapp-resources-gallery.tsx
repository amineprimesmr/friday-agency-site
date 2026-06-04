"use client";

import { motion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import type { TrackappResourceRow } from "@/lib/trackapp-ressources/scan";
import { cn } from "@/lib/utils";

function formatBytes(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} o`;
  const units = ["Ko", "Mo", "Go", "To"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const decimals = i === 0 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(decimals).replace(/\.0+$/, "")} ${units[i]}`;
}

import { resourcePublicPath } from "@/lib/trackapp-ressources/public-urls";

function mediaUrl(filename: string): string {
  return resourcePublicPath(filename);
}

function previewVideoUrl(filename: string): string {
  return `${mediaUrl(filename)}#t=0.1`;
}

function LazyResourceVideo({ filename, title }: Readonly<{ filename: string; title: string }>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const el = wrapRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div ref={wrapRef} className="relative z-[1] h-full w-full">
      {active ? (
        <video
          className="h-full w-full object-contain"
          controls
          preload="metadata"
          playsInline
          muted
          src={previewVideoUrl(filename)}
          aria-label={`Aperçu vidéo ${title}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#0b0f18] text-center text-[0.78rem] font-medium text-white/45">
          Vidéo prête au chargement
        </div>
      )}
    </div>
  );
}

export function TrackappResourcesGallery({
  items,
  configured,
  embedded = false,
  studio = false,
}: Readonly<{
  items: TrackappResourceRow[];
  configured: boolean;
  embedded?: boolean;
  studio?: boolean;
}>) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!deferred) return items;
    return items.filter((row) => {
      const hay = `${row.title} ${row.videoFile}`.toLowerCase();
      return hay.includes(deferred);
    });
  }, [deferred, items]);

  const zipCount = useMemo(() => items.filter((r) => r.zipFile).length, [items]);

  return (
    <div className={cn("trackapp-resources-root relative overflow-hidden", studio && "trackapp-resources-root--studio")}>

      <section className={embedded ? undefined : "dashboard-section relative"}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {embedded ? (
            <>
              <h2
                id={studio ? "ta-home-resources-title" : undefined}
                className={cn(
                  "m-0 font-bold tracking-tight",
                  studio ? "ta-applab-home-sections__title" : "text-[1.35rem] text-[var(--dash-text)]",
                )}
              >
                Ressources vidéo
              </h2>
              {studio ? (
                <p className="ta-applab-home-sections__desc">
                  Démos UI et packs sources — télécharge les archives ZIP pour builder avec l&apos;IA.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="trackapp-workspace-hero-kicker">Bibliothèque</p>
              <h1 className="trackapp-workspace-hero-title">Ressources vidéo</h1>
              <p className="trackapp-workspace-hero-desc max-w-[62ch]">
                Démos UI et packs sources associés. Parcours la bibliothèque et télécharge les ZIP.
              </p>
            </>
          )}
        </motion.div>

        {!configured ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="trackapp-content-card mt-6 border-dashed border-[var(--dash-border-light)] bg-[var(--dash-surface-2)]"
          >
            <p className="trackapp-content-summary m-0 text-[var(--dash-text-secondary)]">
              Aucun dossier média détecté. Placez vos fichiers dans{" "}
              <code className="rounded-md bg-[var(--ui-surface-soft)] px-1.5 py-0.5 text-[0.8rem] text-[var(--dash-text)] shadow-sm ring-1 ring-[var(--dash-border)]">
                Ressources/
              </code>{" "}
              à la racine du projet,{" "}
              <code className="rounded-md bg-[var(--ui-surface-soft)] px-1.5 py-0.5 text-[0.8rem] text-[var(--dash-text)] shadow-sm ring-1 ring-[var(--dash-border)]">
                ~/Desktop/Ressources
              </code>{" "}
              sur ce Mac, ou{" "}
              <code className="rounded-md bg-[var(--ui-surface-soft)] px-1.5 py-0.5 text-[0.8rem] text-[var(--dash-text)] shadow-sm ring-1 ring-[var(--dash-border)]">
                public/trackapp-ressources
              </code>{" "}
              en prod.
            </p>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap gap-2">
            <span className="dashboard-badge dashboard-badge-purple">{items.length} vidéos</span>
            <span className="dashboard-badge dashboard-badge-success">{zipCount} archives ZIP</span>
            {filtered.length !== items.length ? (
              <span className="dashboard-badge dashboard-badge-warning">{filtered.length} affichées</span>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label className="relative flex w-full max-w-md items-center sm:w-auto">
              <span className="visually-hidden">Filtrer</span>
              <svg
                className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--dash-muted)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer par titre ou fichier…"
                autoComplete="off"
                className="trackapp-ui-input w-full py-2.5 pr-4 pl-10 text-[0.9rem] shadow-[var(--dash-shadow)] transition-[box-shadow,border-color] duration-200"
              />
            </label>
          </div>
        </motion.div>
      </section>

      <motion.ul
        layout
        className="relative mx-auto grid max-w-[1280px] list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.045 },
          },
        }}
      >
        {filtered.map((row) => (
          <motion.li
            key={row.id}
            layout
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="min-w-0"
          >
            <article
              id={row.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-[var(--dash-radius-xl)] border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[var(--dash-shadow)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-[rgba(124,58,237,0.35)] hover:shadow-[var(--dash-shadow-lg)]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[#0b0f18]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(124,58,237,0.12) 0%, transparent 42%, rgba(37,99,235,0.08) 100%)",
                  }}
                />
                <LazyResourceVideo filename={row.videoFile} title={row.title} />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-[1.15rem]">
                <div className="min-w-0">
                  <h2 className="trackapp-content-title text-[1.05rem] leading-snug">{row.title}</h2>
                  <p className="mt-1 truncate font-mono text-[0.72rem] text-[var(--dash-muted)]">{row.videoFile}</p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--dash-border)] pt-3">
                  <span className="dashboard-badge dashboard-badge-purple shrink-0">{formatBytes(row.videoBytes)}</span>
                  {row.zipFile ? (
                    <>
                      <span className="dashboard-badge dashboard-badge-success shrink-0">
                        ZIP · {formatBytes(row.zipBytes)}
                      </span>
                      <a
                        href={mediaUrl(row.zipFile)}
                        download={row.zipFile}
                        className="trackapp-btn-primary-dash ml-auto shrink-0 no-underline"
                      >
                        Télécharger
                      </a>
                    </>
                  ) : (
                    <span className="text-[0.78rem] font-medium text-[var(--dash-muted-light)]">Pas de ZIP associé</span>
                  )}
                </div>
              </div>
            </article>
          </motion.li>
        ))}
      </motion.ul>

      {configured && filtered.length === 0 ? (
        <p className="dashboard-hint mt-10 text-center text-[0.95rem]">
          Aucun résultat pour cette recherche.
        </p>
      ) : null}

      <p className="dashboard-hint mt-12 text-center text-[0.8rem]">
        Les fichiers sont servis depuis votre dossier configuré ; en production, utilisez{" "}
        <code className="rounded bg-[var(--dash-surface-2)] px-1 py-0.5">TRACKAPP_RESOURCES_DIR</code> ou des fichiers dans{" "}
        <code className="rounded bg-[var(--dash-surface-2)] px-1 py-0.5">public/trackapp-ressources</code>.
      </p>
    </div>
  );
}
