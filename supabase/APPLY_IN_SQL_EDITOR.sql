-- Trackapp — favoris (à coller dans Supabase → SQL Editor → Run)
-- Idempotent : relançable sans risque si la table existe déjà.

alter table public.trackapp_profiles
  add column if not exists design_favorites text[] not null default '{}'::text[];

alter table public.trackapp_profiles
  add column if not exists app_favorites text[] not null default '{}'::text[];

alter table public.trackapp_profiles
  add column if not exists ads_favorites text[] not null default '{}'::text[];

drop policy if exists "trackapp_profiles_update_own" on public.trackapp_profiles;

create policy "trackapp_profiles_update_own"
  on public.trackapp_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
