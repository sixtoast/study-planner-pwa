-- Study Planner schema for Supabase
-- Run this in the Supabase SQL Editor after creating your project.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  study_hours_per_day numeric default 4,
  preferred_start_time time default '09:00',
  preferred_end_time time default '17:00',
  subjects text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Study sessions (Pomodoro / revision logs)
create table if not exists public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_minutes integer not null,
  notes text,
  type text check (type in ('pomodoro', 'revision', 'practice')) default 'pomodoro',
  created_at timestamptz default now()
);

-- Auto-generated or manually created study plan slots
create table if not exists public.study_plan_slots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  exam_id text, -- matches id from the static EXAMS_2026 data
  subject text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_plan_slots enable row level security;

-- Policies: users can only see / edit their own data
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can manage own sessions"
  on public.study_sessions for all using (auth.uid() = user_id);

create policy "Users can manage own plan slots"
  on public.study_plan_slots for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
