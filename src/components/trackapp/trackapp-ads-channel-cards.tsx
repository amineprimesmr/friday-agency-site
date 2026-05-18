"use client";

import { TRACKAPP_ADS_CHANNELS } from "@/lib/trackapp-ads-channels";

import { TrackappAdsChannelFavoriteButton } from "@/components/trackapp/trackapp-ads-channel-favorite-button";

type Channel = (typeof TRACKAPP_ADS_CHANNELS)[number];

export function TrackappAdsChannelCards({
  channels,
  loggedIn,
  favoriteKeys,
}: Readonly<{
  channels: readonly Channel[];
  loggedIn: boolean;
  favoriteKeys: readonly string[];
}>) {
  const set = new Set(favoriteKeys);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {channels.map((channel) => (
        <article
          key={channel.id}
          className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <h2 className="m-0 min-w-0 flex-1 text-[1.08rem] font-bold tracking-tight text-[var(--dash-text)]">
              {channel.title}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-600">
                {channel.badge}
              </span>
              <TrackappAdsChannelFavoriteButton
                channelId={channel.id}
                initialFavorite={set.has(channel.id)}
                enabled={loggedIn}
              />
            </div>
          </div>
          <p className="text-[0.9rem] leading-relaxed text-[var(--dash-muted-light)]">{channel.copy}</p>
          <ul className="mt-4 space-y-2">
            {channel.steps.map((step) => (
              <li key={step} className="flex gap-2 text-[0.86rem] font-semibold text-[var(--dash-text-secondary)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" aria-hidden />
                {step}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
