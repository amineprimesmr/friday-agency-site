-- AppLAB : brouillon projet + historique versions prompt (persistance Supabase)

create table if not exists public.trackapp_applab_drafts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  draft jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trackapp_applab_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  stack text not null,
  files jsonb not null default '{}'::jsonb,
  blueprint jsonb not null default '{}'::jsonb,
  quality jsonb not null default '{}'::jsonb,
  full_prompt text not null default '',
  generated_at timestamptz not null default now()
);

create index if not exists trackapp_applab_prompt_versions_user_idx
  on public.trackapp_applab_prompt_versions (user_id, generated_at desc);

alter table public.trackapp_applab_drafts enable row level security;
alter table public.trackapp_applab_prompt_versions enable row level security;

create policy "trackapp_applab_drafts_select_own"
  on public.trackapp_applab_drafts for select
  using (auth.uid() = user_id);

create policy "trackapp_applab_drafts_insert_own"
  on public.trackapp_applab_drafts for insert
  with check (auth.uid() = user_id);

create policy "trackapp_applab_drafts_update_own"
  on public.trackapp_applab_drafts for update
  using (auth.uid() = user_id);

create policy "trackapp_applab_prompt_versions_select_own"
  on public.trackapp_applab_prompt_versions for select
  using (auth.uid() = user_id);

create policy "trackapp_applab_prompt_versions_insert_own"
  on public.trackapp_applab_prompt_versions for insert
  with check (auth.uid() = user_id);

create policy "trackapp_applab_prompt_versions_delete_own"
  on public.trackapp_applab_prompt_versions for delete
  using (auth.uid() = user_id);
