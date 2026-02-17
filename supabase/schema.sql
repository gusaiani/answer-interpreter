-- ============================================================
-- MKT Positioner — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helper function to check admin status (bypasses RLS to avoid recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

alter table public.profiles enable row level security;

-- Users can read own profile; admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users can update own profile; admins can update all
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Interviews
create table public.interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  status text default 'em_andamento' check (status in ('em_andamento', 'concluido')),
  identifier_label text,
  identifier_value text,
  sector text,
  brand_type text,
  current_stage text,
  synthesis jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.interviews enable row level security;

create policy "Users can CRUD own interviews"
  on public.interviews for all
  using (auth.uid() = user_id);

create policy "Admins can view all interviews"
  on public.interviews for select
  using (public.is_admin());

-- 3. Interview Messages
create table public.interview_messages (
  id uuid default gen_random_uuid() primary key,
  interview_id uuid references public.interviews(id) on delete cascade not null,
  role text not null check (role in ('user', 'model')),
  content text not null,
  created_at timestamptz default now()
);

create index idx_interview_messages_interview_created
  on public.interview_messages (interview_id, created_at);

alter table public.interview_messages enable row level security;

create policy "Users can CRUD own interview messages"
  on public.interview_messages for all
  using (
    exists (
      select 1 from public.interviews
      where id = interview_messages.interview_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can view all interview messages"
  on public.interview_messages for select
  using (public.is_admin());

-- 4. Batch Jobs
create table public.batch_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  prompt text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.batch_jobs enable row level security;

create policy "Users can CRUD own batch jobs"
  on public.batch_jobs for all
  using (auth.uid() = user_id);

create policy "Admins can view all batch jobs"
  on public.batch_jobs for select
  using (public.is_admin());

-- 5. Batch Items
create table public.batch_items (
  id uuid default gen_random_uuid() primary key,
  batch_job_id uuid references public.batch_jobs(id) on delete cascade not null,
  row_index integer not null,
  question text not null,
  answer text not null,
  processed_answer text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now()
);

alter table public.batch_items enable row level security;

create policy "Users can CRUD own batch items"
  on public.batch_items for all
  using (
    exists (
      select 1 from public.batch_jobs
      where id = batch_items.batch_job_id
      and user_id = auth.uid()
    )
  );

create policy "Admins can view all batch items"
  on public.batch_items for select
  using (public.is_admin());

-- ============================================================
-- To make a user admin:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'you@example.com';
-- ============================================================
