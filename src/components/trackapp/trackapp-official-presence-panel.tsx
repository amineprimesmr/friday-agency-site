"use client";

import { TrackappMetaAdsGallery } from "@/components/trackapp/trackapp-meta-ads-gallery";
import { TrackappSocialGalleriesLazy } from "@/components/trackapp/trackapp-social-galleries-lazy";
import type { OfficialBrandLinksReport, OfficialLinkKey } from "@/lib/official-brand-links";
import type { BrandResolutionSource } from "@/lib/official-brand-presence-context";
import type { MetaAdsLibraryFetchResult } from "@/lib/meta-ads-library";
import type { DetectedSocialProfile } from "@/lib/social-presence";
import { cn } from "@/lib/utils";

const SOCIAL_KEYS: OfficialLinkKey[] = ["instagram", "tiktok", "x", "youtube", "facebook", "linkedin", "threads"];

const STORE_KEYS: OfficialLinkKey[] = ["site", "appStore", "googlePlay", "metaAdsLibrary"];

const KEY_META: Record<
  OfficialLinkKey,
  { short: string; social?: DetectedSocialProfile["id"]; accent: string }
> = {
  site: { short: "Site", accent: "bg-slate-100 text-slate-700 ring-slate-200" },
  instagram: { short: "Instagram", social: "instagram", accent: "bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200" },
  tiktok: { short: "TikTok", social: "tiktok", accent: "bg-slate-900 text-white ring-slate-700" },
  x: { short: "X", social: "x", accent: "bg-slate-100 text-slate-900 ring-slate-200" },
  youtube: { short: "YouTube", social: "youtube", accent: "bg-red-50 text-red-800 ring-red-200" },
  facebook: { short: "Facebook", social: "facebook", accent: "bg-blue-50 text-blue-800 ring-blue-200" },
  linkedin: { short: "LinkedIn", social: "linkedin", accent: "bg-sky-50 text-sky-900 ring-sky-200" },
  threads: { short: "Threads", social: "threads", accent: "bg-slate-100 text-slate-900 ring-slate-300" },
  appStore: { short: "App Store", accent: "bg-slate-100 text-slate-800 ring-slate-200" },
  googlePlay: { short: "Google Play", accent: "bg-emerald-50 text-emerald-900 ring-emerald-200" },
  metaAdsLibrary: { short: "Meta Ads", accent: "bg-indigo-50 text-indigo-900 ring-indigo-200" },
};

function sourceLabel(source: string): string {
  switch (source) {
    case "app_store":
      return "Fiche App Store";
    case "official_site":
      return "Site officiel";
    case "openai_web":
      return "OpenAI";
    case "meta_graph":
      return "Meta Graph";
    case "profile_verify":
      return "Bio vérifiée";
    default:
      return "—";
  }
}

function SocialGlyph({ id }: { id: DetectedSocialProfile["id"] }) {
  const cls = "h-5 w-5";
  switch (id) {
    case "instagram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "x":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" />
        </svg>
      );
  }
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isValidatedOfficialLink(row: OfficialBrandLinksReport[OfficialLinkKey]): row is OfficialBrandLinksReport[OfficialLinkKey] & {
  validated: true;
  url: string;
} {
  return Boolean(row.validated && row.url);
}

function LinkCard({
  linkKey,
  row,
  profile,
}: {
  linkKey: OfficialLinkKey;
  row: OfficialBrandLinksReport[OfficialLinkKey] & { validated: true; url: string };
  profile?: DetectedSocialProfile;
}) {
  const meta = KEY_META[linkKey];

  return (
    <a
      href={row.url}
      target="_blank"
      rel="noopener noreferrer"
      title={row.reason}
      className={cn(
        "group flex flex-col gap-3 rounded-[20px] border p-4 no-underline transition",
        "border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[var(--dash-shadow-lg)]",
      )}
    >
      <span
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[0.72rem] font-bold ring-1",
          meta.accent,
        )}
      >
        {meta.social ? <SocialGlyph id={meta.social} /> : null}
        {meta.short}
      </span>
      <span className="truncate text-[0.88rem] font-semibold text-[var(--dash-text)] group-hover:text-slate-950">
        {profile?.hint || hostname(row.url)}
      </span>
      <span className="truncate text-[0.75rem] text-[var(--dash-muted-light)]">{hostname(row.url)}</span>
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {sourceLabel(row.source)} ↗
      </span>
    </a>
  );
}

export function TrackappOfficialPresencePanel({
  appId,
  appName,
  officialLinks,
  profiles,
  sources,
  metaAds,
  metaPageName,
  instagramProfileUrl,
  tiktokProfileUrl,
}: {
  appId: string;
  appName: string;
  officialLinks: OfficialBrandLinksReport;
  profiles: DetectedSocialProfile[];
  sources: BrandResolutionSource[];
  metaAds: MetaAdsLibraryFetchResult | null;
  metaPageName?: string | null;
  instagramProfileUrl: string | null;
  tiktokProfileUrl: string | null;
}) {
  const profileByKey = new Map<DetectedSocialProfile["id"], DetectedSocialProfile>();
  for (const p of profiles) profileByKey.set(p.id, p);

  const socialKeys = SOCIAL_KEYS.filter((key) => isValidatedOfficialLink(officialLinks[key]));
  const storeKeys = STORE_KEYS.filter((key) => isValidatedOfficialLink(officialLinks[key]));

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
      <div className="border-b border-[var(--dash-border)] bg-gradient-to-br from-slate-50 to-white px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">Présence officielle</p>
            <h3 className="mt-1 text-[1.35rem] font-black tracking-tight text-[var(--dash-text)]">{appName}</h3>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {socialKeys.length > 0 ? (
          <>
            <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Réseaux sociaux</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {socialKeys.map((key) => (
                <LinkCard
                  key={key}
                  linkKey={key}
                  row={officialLinks[key] as OfficialBrandLinksReport[OfficialLinkKey] & {
                    validated: true;
                    url: string;
                  }}
                  profile={KEY_META[key].social ? profileByKey.get(KEY_META[key].social!) : undefined}
                />
              ))}
            </div>
          </>
        ) : null}

        {storeKeys.length > 0 ? (
          <>
            <p
              className={cn(
                "mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400",
                socialKeys.length > 0 && "mt-8",
              )}
            >
              Site & stores
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {storeKeys.map((key) => (
                <LinkCard
                  key={key}
                  linkKey={key}
                  row={officialLinks[key] as OfficialBrandLinksReport[OfficialLinkKey] & {
                    validated: true;
                    url: string;
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        {metaAds ? <TrackappMetaAdsGallery result={metaAds} pageName={metaPageName} /> : null}
        <TrackappSocialGalleriesLazy
          instagramProfileUrl={instagramProfileUrl}
          tiktokProfileUrl={tiktokProfileUrl}
        />

        {sources.filter((s) => s.url).length > 0 ? (
          <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <summary className="cursor-pointer text-[0.82rem] font-bold text-slate-700">Sources de validation</summary>
            <ul className="mt-3 space-y-2">
              {sources
                .filter((s) => s.url)
                .slice(0, 8)
                .map((s) => (
                  <li key={`${s.label}-${s.url}`} className="text-[0.8rem] text-slate-600">
                    <span className="font-semibold text-slate-800">{s.label}</span>
                    {" · "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-slate-700 underline-offset-2 hover:underline">
                      {hostname(s.url!)}
                    </a>
                  </li>
                ))}
            </ul>
          </details>
        ) : null}
      </div>
    </div>
  );
}
