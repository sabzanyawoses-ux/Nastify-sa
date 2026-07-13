-- Safe to run multiple times — drops old policies first if they exist.

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('renter', 'landlord')) default 'renter',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);


-- Listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  city text not null,
  suburb text not null,
  price_zar numeric not null,
  room_type text not null,
  description text,
  amenities text[] default '{}',
  image_url text,
  whatsapp_number text not null,
  contact_email text not null,
  verified boolean default false,
  created_at timestamptz default now()
);

alter table listings enable row level security;

drop policy if exists "Listings are viewable by everyone" on listings;
drop policy if exists "Owners can insert their own listings" on listings;
drop policy if exists "Owners can update their own listings" on listings;
drop policy if exists "Owners can delete their own listings" on listings;

create policy "Listings are viewable by everyone"
  on listings for select using (true);

create policy "Owners can insert their own listings"
  on listings for insert with check (auth.uid() = owner_id);

create policy "Owners can update their own listings"
  on listings for update using (auth.uid() = owner_id);

create policy "Owners can delete their own listings"
  on listings for delete using (auth.uid() = owner_id);


-- Payments
create table if not exists payments (
  payment_id text primary key,
  pf_payment_id text,
  status text,
  amount_gross text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

alter table payments enable row level security;

drop policy if exists "No public access to payments" on payments;

create policy "No public access to payments"
  on payments for select using (false);
