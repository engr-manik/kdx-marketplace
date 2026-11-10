-- KDX starter database schema for Supabase PostgreSQL.
-- Run in Supabase SQL Editor. Never put the service_role key in frontend code.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  role text not null check (role in ('buyer','seller','both')),
  phone text not null,
  trade_license text not null,
  nid_reference text not null,
  business_address text not null,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.do_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  seller_name text not null,
  do_number text not null,
  product text not null,
  quantity text not null,
  unit text not null,
  asking_price numeric(14,2) not null check (asking_price > 0),
  issuer text not null,
  valid_until date not null,
  status text not null default 'available'
    check (status in ('available','reserved','transferred','completed','withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.do_listings(id),
  buyer_id uuid not null references public.profiles(id),
  buyer_name text not null,
  seller_id uuid not null references public.profiles(id),
  seller_name text not null,
  status text not null default 'requested'
    check (status in ('requested','negotiating','issuer_verification','confirmed','transfer_in_progress','transferred','completed','cancelled')),
  agreed_price numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.do_listings enable row level security;
alter table public.deals enable row level security;

-- Profiles: a trader can create/read/update only their own profile.
create policy "profile select own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profile insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profile update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Public marketplace: anyone can view available listings.
create policy "public read available listings" on public.do_listings for select using (status = 'available' or auth.uid() = seller_id);
-- Verified seller can create own listings.
create policy "verified seller creates listing" on public.do_listings for insert to authenticated
with check (
  auth.uid() = seller_id and exists (
    select 1 from public.profiles p where p.id = auth.uid()
    and p.verification_status = 'verified' and p.role in ('seller','both')
  )
);
create policy "seller updates own listing" on public.do_listings for update to authenticated
using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

-- Deal records visible to buyer and seller. Verified buyer creates request.
create policy "deal parties read" on public.deals for select to authenticated
using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "verified buyer creates deal" on public.deals for insert to authenticated
with check (
  auth.uid() = buyer_id and exists (
    select 1 from public.profiles p where p.id = auth.uid()
    and p.verification_status = 'verified' and p.role in ('buyer','both')
  )
);

-- IMPORTANT: Admin review should be performed only by trusted operators in the
-- Supabase dashboard or a future server-side admin API protected by admin role.
-- Do not add a public policy allowing users to set their own verification_status.
