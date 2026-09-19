-- =========================================================
-- SOCIAL SWINGERS — Schema completo para Supabase PostgreSQL
-- Ejecutar en el Editor SQL de Supabase (SQL Editor)
-- =========================================================

-- 1. TABLAS PRINCIPALES
-- ---------------------------------------------------------

-- Perfiles (vinculados 1:1 a auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Publicaciones
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reacciones (una reacción por usuario y publicación)
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (post_id, user_id)
);

-- Comentarios
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Solicitudes / relaciones de amistad
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (sender_id, receiver_id)
);

-- Índices útiles
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_reactions_post_id on public.reactions(post_id);
create index idx_comments_post_id on public.comments(post_id);
create index idx_friendships_receiver on public.friendships(receiver_id);

-- 2. TRIGGER: crear perfil automáticamente al registrarse
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.friendships enable row level security;

-- Perfiles: lectura pública, edición solo del propio usuario
create policy "Los perfiles son visibles para todos"
  on public.profiles for select using (true);

create policy "El usuario puede actualizar su propio perfil"
  on public.profiles for update using (auth.uid() = id);

-- Posts: lectura pública, creación/edición/borrado solo del dueño
create policy "Los posts son visibles para todos"
  on public.posts for select using (true);

create policy "El usuario autenticado puede crear posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "El dueño puede editar su post"
  on public.posts for update using (auth.uid() = user_id);

create policy "El dueño puede borrar su post"
  on public.posts for delete using (auth.uid() = user_id);

-- Reacciones: lectura pública, gestión solo del propio usuario
create policy "Las reacciones son visibles para todos"
  on public.reactions for select using (true);

create policy "El usuario gestiona sus propias reacciones"
  on public.reactions for insert with check (auth.uid() = user_id);

create policy "El usuario actualiza sus propias reacciones"
  on public.reactions for update using (auth.uid() = user_id);

create policy "El usuario borra sus propias reacciones"
  on public.reactions for delete using (auth.uid() = user_id);

-- Comentarios: lectura pública, creación/borrado del propio autor
create policy "Los comentarios son visibles para todos"
  on public.comments for select using (true);

create policy "El usuario autenticado puede comentar"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "El autor puede borrar su comentario"
  on public.comments for delete using (auth.uid() = user_id);

-- Amistades: visibles solo para emisor/receptor, gestionadas por ambos
create policy "Los involucrados ven la solicitud"
  on public.friendships for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "El emisor crea la solicitud"
  on public.friendships for insert with check (auth.uid() = sender_id);

create policy "El receptor puede aceptar o rechazar"
  on public.friendships for update
  using (auth.uid() = receiver_id or auth.uid() = sender_id);

-- 4. STORAGE: buckets para avatares e imágenes de posts
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('posts-images', 'posts-images', true)
on conflict (id) do nothing;

create policy "Lectura pública de avatares"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "El usuario sube su propio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Lectura pública de imágenes de posts"
  on storage.objects for select using (bucket_id = 'posts-images');

create policy "El usuario sube imágenes a sus posts"
  on storage.objects for insert
  with check (bucket_id = 'posts-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 5. REALTIME: habilitar replicación para feed en vivo
-- ---------------------------------------------------------
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.comments;
