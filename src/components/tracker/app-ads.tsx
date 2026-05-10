"use client";

import { useState } from "react";

type Platform = "meta" | "tiktok" | "google";

const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "meta", label: "Meta Ads", icon: "🟦", color: "text-blue-400" },
  { id: "tiktok", label: "TikTok Ads", icon: "⬛", color: "text-white" },
  { id: "google", label: "Google UAC", icon: "🔴", color: "text-red-400" },
];

function MetaAdsPanel({ developerName, appName }: { developerName: string; appName: string }) {
  // Recherche dans la Meta Ad Library par nom du développeur ou de l'app
  const searchQuery = encodeURIComponent(developerName || appName);
  const metaUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${searchQuery}&search_type=keyword_unordered&media_type=all`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">
            Recherche dans la Meta Ad Library pour <span className="font-semibold text-white/80">{developerName}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Publicités Facebook, Instagram, Messenger, Audience Network actives
          </p>
        </div>
        <a
          href={metaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-400/20"
        >
          Ouvrir Meta Library ↗
        </a>
      </div>

      {/* Embedded preview card */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">Meta Ad Library</p>
            <p className="text-[11px] text-white/40">Toutes les pubs actives — données publiques Meta</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {/* Placeholder cards simulant des publicités */}
          {[
            { label: "Feed Facebook", format: "1:1 · Image/Vidéo", badge: "Popular" },
            { label: "Story Instagram", format: "9:16 · Vidéo", badge: "Trending" },
            { label: "Reels Instagram", format: "9:16 · Vidéo", badge: null },
            { label: "Feed Instagram", format: "4:5 · Carousel", badge: null },
            { label: "Messenger", format: "1:1 · Image", badge: null },
            { label: "Audience Network", format: "Banner · Display", badge: null },
          ].map((slot) => (
            <div
              key={slot.label}
              className="relative flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              {slot.badge && (
                <span className="absolute right-2 top-2 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                  {slot.badge}
                </span>
              )}
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
                📣
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/70">{slot.label}</p>
                <p className="text-[10px] text-white/30">{slot.format}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] bg-blue-500/[0.04] px-4 py-3">
          <p className="text-[11px] text-white/40">
            📌 Clique sur &quot;Ouvrir Meta Library&quot; pour voir les vraies créas actives de <strong className="text-white/60">{developerName}</strong> en temps réel.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: "👁", label: "Impressions", tip: "Visibles dans la Meta Library" },
          { icon: "📅", label: "Date de lancement", tip: "Date de début de chaque pub" },
          { icon: "🌍", label: "Pays ciblés", tip: "Géociblage par pub" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-white/70">{item.label}</p>
              <p className="text-[10px] text-white/35">{item.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TikTokAdsPanel({ appName, developerName }: { appName: string; developerName: string }) {
  const searchQuery = encodeURIComponent(appName);
  const tiktokUrl = `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?search=${searchQuery}`;
  const tiktokBrandUrl = `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">
            TikTok Creative Center pour <span className="font-semibold text-white/80">{appName}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Top ads, tendances créatives, performances estimées
          </p>
        </div>
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white"
        >
          TikTok Creative Center ↗
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-white text-sm font-bold">
            T
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">TikTok Ads Intelligence</p>
            <p className="text-[11px] text-white/40">Top performing creatives — données TikTok Business</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {[
            { label: "In-Feed Ads", format: "9:16 · 15-60s", score: "98" },
            { label: "TopView", format: "9:16 · 5-60s", score: "95" },
            { label: "Branded Hashtag", format: "Challenge", score: null },
            { label: "Spark Ads", format: "Organique boosté", score: null },
          ].map((slot) => (
            <div
              key={slot.label}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              {slot.score && (
                <span className="rounded-full bg-pink-400/10 px-2 py-0.5 text-[9px] font-bold text-pink-300">
                  Score {slot.score}
                </span>
              )}
              <div className="h-10 w-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-xl">
                🎵
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/70">{slot.label}</p>
                <p className="text-[10px] text-white/30">{slot.format}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-white/40">
            📌 Clique sur &quot;TikTok Creative Center&quot; pour voir les tops ads de la catégorie de <strong className="text-white/60">{appName}</strong>.
          </p>
        </div>
      </div>

      {/* Formats breakdown */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/25">Formats recommandés pour apps mobiles</p>
        <div className="space-y-2">
          {[
            { format: "In-Feed Video", ratio: "9:16", duration: "15-30s", ctr: "Très élevé", color: "bg-pink-400" },
            { format: "Spark Ads (UGC)", ratio: "9:16", duration: "15-60s", ctr: "Élevé", color: "bg-violet-400" },
            { format: "TopView", ratio: "9:16", duration: "5-60s", ctr: "Maximum", color: "bg-cyan-400" },
            { format: "Collection Ads", ratio: "1:1 + 9:16", duration: "N/A", ctr: "Moyen", color: "bg-amber-400" },
          ].map((row) => (
            <div key={row.format} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${row.color}`} />
              <span className="w-40 text-xs text-white/70">{row.format}</span>
              <span className="w-12 text-[11px] font-mono text-white/40">{row.ratio}</span>
              <span className="w-16 text-[11px] text-white/40">{row.duration}</span>
              <span className="text-[11px] text-white/50">CTR {row.ctr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoogleAdsPanel({ appName, bundleId }: { appName: string; bundleId: string }) {
  const googleUrl = `https://adstransparency.google.com/?region=anywhere&query=${encodeURIComponent(appName)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">
            Google Ads Transparency Center pour <span className="font-semibold text-white/80">{appName}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Universal App Campaigns (UAC), Search, Display, YouTube
          </p>
        </div>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/20"
        >
          Google Transparency ↗
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-lg">
            🔴
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">Google UAC Intelligence</p>
            <p className="text-[11px] text-white/40">Search, Play Store, YouTube, Display Network</p>
          </div>
          {bundleId && (
            <span className="ml-auto rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-white/30">
              {bundleId.slice(0, 30)}{bundleId.length > 30 ? "…" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {[
            { label: "Google Play", format: "Store listing", icon: "📱" },
            { label: "YouTube Ads", format: "Pre-roll 6-30s", icon: "▶️" },
            { label: "Display", format: "Banner / Interstitiel", icon: "🖼" },
            { label: "Search Ads", format: "Texte sponsorisé", icon: "🔍" },
          ].map((slot) => (
            <div
              key={slot.label}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              <span className="text-2xl">{slot.icon}</span>
              <div>
                <p className="text-[11px] font-medium text-white/70">{slot.label}</p>
                <p className="text-[10px] text-white/30">{slot.format}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppAds({
  appName,
  developerName,
  bundleId,
}: {
  appName: string;
  developerName: string;
  bundleId: string;
}) {
  const [platform, setPlatform] = useState<Platform>("meta");

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              platform === p.id
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-white/45 hover:border-white/15 hover:text-white/80"
            }`}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {platform === "meta" && (
        <MetaAdsPanel developerName={developerName} appName={appName} />
      )}
      {platform === "tiktok" && (
        <TikTokAdsPanel appName={appName} developerName={developerName} />
      )}
      {platform === "google" && (
        <GoogleAdsPanel appName={appName} bundleId={bundleId} />
      )}

      {/* Attribution disclaimer */}
      <p className="text-[11px] text-white/20">
        Les données publicitaires sont issues des API publiques Meta Ad Library, TikTok Creative Center et Google Ads Transparency. Aucune donnée privée n&apos;est collectée.
      </p>
    </div>
  );
}
