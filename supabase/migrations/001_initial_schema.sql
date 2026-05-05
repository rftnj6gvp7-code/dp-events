-- ============================================================
-- DP Events Platform — Schéma complet Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Extension pour générer des UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE : profiles (étend auth.users de Supabase)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text not null,
  email       text not null,
  role        text not null default 'user' check (role in ('admin', 'user')),
  status      text not null default 'pending' check (status in ('pending', 'active', 'rejected')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLE : events
-- ============================================================
create table public.events (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null,
  description   text,
  date          date not null,
  time          time not null,
  location      text not null,
  category      text not null default 'other' check (category in ('conference','sport','workshop','social','other')),
  max_attendees integer not null default 30,
  cover_url     text,
  color         text default '#7C3AED',
  is_cancelled  boolean default false,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABLE : registrations (inscriptions aux événements)
-- ============================================================
create table public.registrations (
  id          uuid default uuid_generate_v4() primary key,
  event_id    uuid references public.events(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- TABLE : notifications
-- ============================================================
create table public.notifications (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  body        text,
  type        text not null default 'info' check (type in ('new_event','event_modified','event_cancelled','account_validated','info')),
  event_id    uuid references public.events(id) on delete set null,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- FUNCTION : updated_at trigger
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();

create trigger set_events_updated_at before update on public.events
  for each row execute function update_updated_at();

-- ============================================================
-- FUNCTION : auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    case when new.raw_user_meta_data->>'role' = 'admin' then 'active' else 'pending' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCTION : notifier tous les utilisateurs actifs d'un event
-- ============================================================
create or replace function notify_all_active_users(
  p_title text,
  p_body text,
  p_type text,
  p_event_id uuid default null
) returns void as $$
begin
  insert into public.notifications (user_id, title, body, type, event_id)
  select id, p_title, p_body, p_type, p_event_id
  from public.profiles
  where status = 'active';
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.notifications enable row level security;

-- Profiles : lecture publique des profils actifs, chacun gère le sien
create policy "Profils actifs visibles par tous" on public.profiles
  for select using (status = 'active' or auth.uid() = id);

create policy "Chacun met à jour son propre profil" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins gèrent tous les profils" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Events : lecture par tous les actifs, écriture admin
create policy "Events visibles par utilisateurs actifs" on public.events
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );

create policy "Admins gèrent les events" on public.events
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Registrations
create policy "Voir les inscriptions de ses events" on public.registrations
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );

create policy "S'inscrire si actif" on public.registrations
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
  );

create policy "Se désinscrire" on public.registrations
  for delete using (auth.uid() = user_id);

-- Notifications
create policy "Ses propres notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Marquer comme lu" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Admins peuvent créer des notifications" on public.notifications
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- STORAGE : bucket pour les photos d'événements
-- ============================================================
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict do nothing;

create policy "Covers accessibles publiquement" on storage.objects
  for select using (bucket_id = 'event-covers');

create policy "Admins uploadent les covers" on storage.objects
  for insert with check (
    bucket_id = 'event-covers'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins suppriment les covers" on storage.objects
  for delete using (
    bucket_id = 'event-covers'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- DONNÉES INITIALES : compte admin
-- ============================================================
-- IMPORTANT : Créer d'abord le compte via Supabase Auth Dashboard ou l'API auth,
-- puis exécuter ceci pour le passer admin/active :
--
-- update public.profiles
-- set role = 'admin', status = 'active'
-- where email = 'votre-email@dp.lu';
