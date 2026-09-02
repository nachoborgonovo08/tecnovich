-- ─────────────────────────────────────────────────────────────
-- Sistema de Reservas · Tecnovich
-- Correr este archivo en el SQL Editor de Supabase (una sola vez)
-- ─────────────────────────────────────────────────────────────

-- ── Perfiles (extienden auth.users) ─────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null default '',
  rol        text not null default 'Docente' check (rol in ('Docente','Coordinador')),
  created_at timestamptz not null default now()
);

-- ── Materiales / categorías ────────────────────────────────
create table if not exists public.materiales (
  clave       text primary key,
  nombre      text not null,
  total       int  not null default 0,
  capacidad   int,
  updated_at  timestamptz not null default now()
);

-- ── Reservas ───────────────────────────────────────────────
create table if not exists public.reservas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  item           text not null references public.materiales(clave) on update cascade,
  cantidad       int  not null default 1 check (cantidad >= 1),
  fecha          date not null,
  observaciones  text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_reservas_fecha       on public.reservas(fecha);
create index if not exists idx_reservas_item_fecha  on public.reservas(item, fecha);

-- ── Datos iniciales ────────────────────────────────────────
insert into public.materiales (clave, nombre, total, capacidad) values
  ('portatiles',  'Computadoras Portátiles', 20, null),
  ('routers',     'Routers WiFi',            10, null),
  ('proyectores', 'Proyectores',              8, null),
  ('tallerA',     'Taller de Informática A',  1, 30),
  ('tallerB',     'Taller de Informática B',  1, 25)
on conflict (clave) do nothing;

-- ── Auto-crear profile cuando se crea un auth.user ─────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)), 'Docente')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ─────────────────────────────────────
alter table public.profiles   enable row level security;
alter table public.materiales enable row level security;
alter table public.reservas   enable row level security;

-- profiles: lectura pública, self-update
drop policy if exists "profiles_read"       on public.profiles;
drop policy if exists "profiles_upsert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_read"       on public.profiles for select using (true);
create policy "profiles_upsert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- materiales: lectura pública, update solo Coordinador
drop policy if exists "materiales_read"       on public.materiales;
drop policy if exists "materiales_update_adm" on public.materiales;
create policy "materiales_read" on public.materiales for select using (true);
create policy "materiales_update_adm"
  on public.materiales for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.rol = 'Coordinador')
  );

-- reservas: lectura pública, insert propio, delete propio
drop policy if exists "reservas_read"        on public.reservas;
drop policy if exists "reservas_insert_own"  on public.reservas;
drop policy if exists "reservas_delete_own"  on public.reservas;
create policy "reservas_read"       on public.reservas for select using (true);
create policy "reservas_insert_own" on public.reservas for insert with check (auth.uid() = user_id);
create policy "reservas_delete_own" on public.reservas for delete using (auth.uid() = user_id);
