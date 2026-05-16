create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  username text,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  constraint clients_email_or_username_required check (
    nullif(trim(coalesce(email, '')), '') is not null
    or nullif(trim(coalesce(username, '')), '') is not null
  )
);

create unique index if not exists clients_email_unique
  on public.clients (lower(email))
  where email is not null;

create unique index if not exists clients_username_unique
  on public.clients (lower(username))
  where username is not null;

create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  slug text not null unique,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists galleries_client_id_idx on public.galleries(client_id);
create index if not exists galleries_slug_idx on public.galleries(slug);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  storage_path text not null,
  thumbnail_path text,
  filename text not null,
  size bigint,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_gallery_id_idx on public.gallery_images(gallery_id);

alter table public.admin_users enable row level security;
alter table public.clients enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_images enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins manage clients" on public.clients;
create policy "Admins manage clients"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage galleries" on public.galleries;
create policy "Admins manage galleries"
on public.galleries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage gallery images" on public.gallery_images;
create policy "Admins manage gallery images"
on public.gallery_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-galleries',
  'client-galleries',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins manage client gallery files" on storage.objects;
create policy "Admins manage client gallery files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'client-galleries'
  and public.is_admin()
)
with check (
  bucket_id = 'client-galleries'
  and public.is_admin()
);
