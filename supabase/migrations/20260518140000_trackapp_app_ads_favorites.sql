-- Favoris apps (trackId App Store) et canaux Ads (clés stables côté app)

alter table public.trackapp_profiles
  add column if not exists app_favorites text[] not null default '{}'::text[];

alter table public.trackapp_profiles
  add column if not exists ads_favorites text[] not null default '{}'::text[];

comment on column public.trackapp_profiles.app_favorites is 'IDs App Store (trackId) mis en favori pour rappels rapides.';
comment on column public.trackapp_profiles.ads_favorites is 'Clés de canaux Ads (apple-search-ads, meta-ads, tiktok-ads) mises en favori.';
