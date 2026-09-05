-- Developer profiles for contribmatch.
-- Apply in the Supabase SQL editor or via `supabase db push` if the CLI is linked.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  github_username text,
  display_name text,
  avatar_url text,
  experience_level text,
  languages text[] not null default '{}'::text[],
  technologies text[] not null default '{}'::text[],
  interests text[] not null default '{}'::text[],
  learning_goals text[] not null default '{}'::text[],
  contribution_types text[] not null default '{}'::text[],
  preferred_difficulty text,
  available_time text,
  operating_system text,
  ram_gb integer,
  cpu text,
  gpu text,
  docker_available boolean,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One developer profile per authenticated user. id matches auth.users.id.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

-- Create a profile row as soon as a GitHub user signs up.
-- GitHub metadata is optional; coalesce/nullif avoids inserting empty strings.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, github_username, display_name, avatar_url)
  values (
    new.id,
    nullif(coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'login'
    ), ''),
    nullif(coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ), ''),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant select, insert, update on table public.profiles to authenticated;
