-- Trackapp : profil SaaS par utilisateur Supabase Auth (exécuter dans le SQL editor Supabase)
-- Une fois créé : activer Email provider dans Authentication → Providers.

create table if not exists public.trackapp_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  onboarding jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  source_app_store_id text,
  plan_unlocked_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text
);

alter table public.trackapp_profiles enable row level security;

create policy "trackapp_profiles_select_own"
  on public.trackapp_profiles for select
  using (auth.uid() = id);

create policy "trackapp_profiles_insert_own"
  on public.trackapp_profiles for insert
  with check (auth.uid() = id);

create policy "trackapp_profiles_update_own"
  on public.trackapp_profiles for update
  using (auth.uid() = id);
