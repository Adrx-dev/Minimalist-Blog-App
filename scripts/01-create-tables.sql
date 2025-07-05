-- Enable RLS
alter table if exists public.profiles disable row level security;
alter table if exists public.posts disable row level security;

-- Drop existing tables if they exist
drop table if exists public.posts;
drop table if exists public.profiles;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Posts policies
create policy "Published posts are viewable by everyone" on public.posts
  for select using (published = true or auth.uid() = author_id);

create policy "Users can insert their own posts" on public.posts
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts" on public.posts
  for update using (auth.uid() = author_id);

create policy "Users can delete their own posts" on public.posts
  for delete using (auth.uid() = author_id);

-- Create indexes
create index posts_slug_idx on public.posts(slug);
create index posts_author_id_idx on public.posts(author_id);
create index posts_published_idx on public.posts(published);
create index posts_created_at_idx on public.posts(created_at desc);
