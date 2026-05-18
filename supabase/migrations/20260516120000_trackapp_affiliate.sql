-- Programme d'affiliation Trackapp : parrainage, commissions 50 %, payouts Connect

alter table public.trackapp_profiles
  add column if not exists referral_code text,
  add column if not exists referred_by_id uuid references public.trackapp_profiles (id) on delete set null,
  add column if not exists stripe_connect_account_id text,
  add column if not exists affiliate_enrolled_at timestamptz;

create unique index if not exists trackapp_profiles_referral_code_key
  on public.trackapp_profiles (referral_code)
  where referral_code is not null;

create index if not exists trackapp_profiles_referred_by_id_idx
  on public.trackapp_profiles (referred_by_id)
  where referred_by_id is not null;

create table if not exists public.trackapp_affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  affiliate_user_id uuid not null references public.trackapp_profiles (id) on delete cascade,
  referred_user_id uuid not null references public.trackapp_profiles (id) on delete cascade,
  stripe_event_id text not null,
  stripe_checkout_session_id text,
  stripe_invoice_id text,
  stripe_subscription_id text,
  gross_amount_cents integer not null check (gross_amount_cents >= 0),
  commission_cents integer not null check (commission_cents >= 0),
  commission_rate numeric(5, 4) not null default 0.5,
  currency text not null default 'eur',
  event_type text not null check (event_type in ('initial', 'renewal')),
  status text not null default 'pending' check (
    status in ('pending', 'available', 'paid', 'reversed')
  ),
  available_at timestamptz not null,
  payout_id uuid,
  description text
);

create unique index if not exists trackapp_affiliate_commissions_stripe_event_id_key
  on public.trackapp_affiliate_commissions (stripe_event_id);

create index if not exists trackapp_affiliate_commissions_affiliate_status_idx
  on public.trackapp_affiliate_commissions (affiliate_user_id, status);

create table if not exists public.trackapp_affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  affiliate_user_id uuid not null references public.trackapp_profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur',
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'failed')
  ),
  stripe_transfer_id text,
  failure_message text
);

alter table public.trackapp_affiliate_commissions
  add constraint trackapp_affiliate_commissions_payout_id_fkey
  foreign key (payout_id) references public.trackapp_affiliate_payouts (id) on delete set null;

alter table public.trackapp_affiliate_commissions enable row level security;
alter table public.trackapp_affiliate_payouts enable row level security;

create policy "affiliate_commissions_select_own"
  on public.trackapp_affiliate_commissions for select
  using (auth.uid() = affiliate_user_id);

create policy "affiliate_payouts_select_own"
  on public.trackapp_affiliate_payouts for select
  using (auth.uid() = affiliate_user_id);

-- Génération automatique du code parrain à l'insert profil
create or replace function public.trackapp_profiles_set_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  end if;
  if new.affiliate_enrolled_at is null then
    new.affiliate_enrolled_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trackapp_profiles_referral_code_trigger on public.trackapp_profiles;

create trigger trackapp_profiles_referral_code_trigger
  before insert on public.trackapp_profiles
  for each row
  execute function public.trackapp_profiles_set_referral_code();

-- Profils existants sans code
update public.trackapp_profiles
set
  referral_code = lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  affiliate_enrolled_at = coalesce(affiliate_enrolled_at, now())
where referral_code is null or referral_code = '';
