-- Favoris designs (références = ids issus du scan ressources, champ TrackappResourceRow.id)

alter table public.trackapp_profiles
  add column if not exists design_favorites text[] not null default '{}'::text[];

comment on column public.trackapp_profiles.design_favorites is 'IDs favoris (base64url du stem fichier vidéo) pour la bibliothèque designs Trackapp.';
