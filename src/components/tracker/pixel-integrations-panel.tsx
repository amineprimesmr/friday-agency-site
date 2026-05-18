"use client";

import { useEffect, useState } from "react";
import type { DetectedSocialProfile } from "@/lib/social-presence";
import type { BrandResolutionSource } from "@/lib/tracker-meta-ad-library-context";

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconSnap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.206.793c.99 0 4.347.276 5.426 3.821 1.053 3.462 1.041 6.869-.035 9.871-.966 2.674-3.215 3.76-5.391 3.76C9.92 18.245 7.53 16.77 6.84 13.88c-.376-1.712-.376-4.261 0-5.973C7.53 4.016 9.92 2.54 12.206 2.54zm-.162 3.51c-2.06 0-3.655 1.49-3.655 3.53 0 .55.06 1.13.17 1.67l.07.33-.33-.07a3.91 3.91 0 0 0-1.07-.11c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74c.43 0 .84-.16 1.16-.45l.27-.22.24.26c.92 1 2.22 1.55 3.58 1.55s2.66-.55 3.58-1.55l.24-.26.27.22c.32.29.73.45 1.16.45.96 0 1.74-.78 1.74-1.74s-.78-1.74-1.74-1.74c-.36 0-.72.04-1.07.11l-.33.07.07-.33c.11-.54.17-1.12.17-1.67 0-2.04-1.59-3.53-3.65-3.53z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconPinterest({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
  );
}

function IconLinkGeneric({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function networkIcon(id: DetectedSocialProfile["id"]) {
  const cls = "h-5 w-5";
  switch (id) {
    case "instagram":
      return <IconInstagram className={cls} />;
    case "facebook":
      return <IconFacebook className={cls} />;
    case "tiktok":
      return <IconTikTok className={cls} />;
    case "youtube":
      return <IconYouTube className={cls} />;
    case "x":
      return <IconX className={cls} />;
    case "snapchat":
      return <IconSnap className={cls} />;
    case "linkedin":
      return <IconLinkedIn className={cls} />;
    case "pinterest":
      return <IconPinterest className={cls} />;
    case "threads":
    case "bluesky":
    case "discord":
    case "reddit":
    case "twitch":
    case "medium":
      return <IconLinkGeneric className={cls} />;
    default:
      return <IconLinkGeneric className={cls} />;
  }
}

export function SocialPresenceStrip({
  profiles,
  appName,
  enrichedByAi,
  officialWebsite,
  confidence,
  sources,
}: {
  profiles: DetectedSocialProfile[];
  appName: string;
  /** Vrai si des liens ont été proposés par le modèle (à valider manuellement). */
  enrichedByAi?: boolean;
  officialWebsite?: string | null;
  confidence?: number;
  sources?: BrandResolutionSource[];
}) {
  const visibleSources = (sources ?? []).filter((source) => source.url).slice(0, 5);
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Réseaux détectés</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Fiche App Store{enrichedByAi ? " · complété par IA web" : ""} · {appName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {typeof confidence === "number" && confidence > 0 ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              confiance {Math.round(confidence * 100)}%
            </span>
          ) : null}
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
            {profiles.length} profil{profiles.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {officialWebsite ? (
        <a
          href={officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-white"
        >
          <IconLinkGeneric className="h-5 w-5 text-neutral-700" />
          <span className="truncate">Site officiel</span>
          <span className="text-neutral-400" aria-hidden>
            ↗
          </span>
        </a>
      ) : null}

      {profiles.length === 0 ? (
        <p className="rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          Aucun lien social officiel détecté pour l’instant. La Librairie Ads restera bloquée tant qu’une Page Meta fiable
          n’est pas résolue.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <li key={`${p.id}-${p.url}`}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-300 hover:bg-white"
              >
                <span className="text-neutral-700">{networkIcon(p.id)}</span>
                <span className="min-w-0 truncate">
                  {p.label}
                  {p.hint ? <span className="font-normal text-neutral-500"> · {p.hint}</span> : null}
                </span>
                <span className="text-neutral-400" aria-hidden>
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {visibleSources.length > 0 ? (
        <div className="mt-4 rounded-xl bg-neutral-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Sources utilisées</p>
          <ul className="mt-2 space-y-1">
            {visibleSources.map((source) => (
              <li key={`${source.source}-${source.url}`} className="truncate text-[12px] text-neutral-500">
                <span className="font-semibold text-neutral-700">{source.label}</span>
                {source.url ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {source.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type PixelId =
  | "ga"
  | "gtm"
  | "pinterest"
  | "microsoft"
  | "meta"
  | "google_ads"
  | "snap"
  | "tiktok";

const PIXELS: { id: PixelId; label: string }[] = [
  { id: "ga", label: "Google Analytics" },
  { id: "gtm", label: "Google Tag Manager" },
  { id: "pinterest", label: "Pinterest Ads" },
  { id: "microsoft", label: "Microsoft Advertising" },
  { id: "meta", label: "Meta Pixel" },
  { id: "google_ads", label: "Google Ads" },
  { id: "snap", label: "Snap Pixel" },
  { id: "tiktok", label: "TikTok Pixel" },
];

export function PixelIntegrationsPanel({
  metaLibraryConfigured,
}: {
  /** Jeton serveur Meta Ad Library présent */
  metaLibraryConfigured: boolean;
}) {
  const [tab, setTab] = useState<"pixels" | "shopify">("pixels");

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex border-b border-neutral-200 p-1">
        <button
          type="button"
          onClick={() => setTab("pixels")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
            tab === "pixels" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
          }`}
        >
          Pixels
        </button>
        <button
          type="button"
          onClick={() => setTab("shopify")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
            tab === "shopify" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
          }`}
        >
          Apps Shopify
        </button>
      </div>

      <div className="p-5">
        {tab === "pixels" ? (
          <>
            <p className="mb-4 text-xs text-neutral-500">
              Phase 1 · La collecte des pubs passe par{" "}
              <strong className="font-medium text-neutral-700">Meta Ad Library (API)</strong>. Les pixels ci‑dessous seront
              branchés quand tu connecteras tes comptes media (OAuth) — pour l’instant c’est un plan de route.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {PIXELS.map((p) => {
                const isMeta = p.id === "meta";
                const ready = isMeta && metaLibraryConfigured;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                      ready ? "border-emerald-200 bg-emerald-50/60 text-emerald-950" : "border-neutral-200 text-neutral-800"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{p.label}</span>
                    {ready ? (
                      <span className="shrink-0 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        API
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-medium uppercase text-neutral-400">Bientôt</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            Connexion Shopify + catalogue produits — prévu dans une prochaine itération.
          </p>
        )}
      </div>
    </div>
  );
}

export function useMetaLibraryConfigured(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/meta/status");
        const j = (await res.json()) as { configured?: boolean };
        if (!cancelled) setOk(Boolean(j.configured));
      } catch {
        if (!cancelled) setOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return ok;
}
