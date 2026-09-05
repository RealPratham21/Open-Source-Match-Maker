-- Cached GitHub repository and issue metadata for contribmatch discovery.
-- Shared across users. Authenticated clients may read and refresh the cache.

create table if not exists public.github_repositories (
  id uuid primary key default gen_random_uuid(),
  github_id bigint unique not null,
  owner text not null,
  name text not null,
  full_name text not null,
  description text,
  url text not null,
  stars integer not null default 0,
  primary_language text,
  topics text[] not null default '{}'::text[],
  pushed_at timestamptz,
  health_score integer,
  raw_metadata jsonb not null default '{}'::jsonb,
  last_scanned_at timestamptz not null default now()
);

create table if not exists public.github_issues (
  id uuid primary key default gen_random_uuid(),
  github_id bigint unique not null,
  repository_id uuid not null references public.github_repositories (id) on delete cascade,
  issue_number integer not null,
  title text not null,
  body text,
  url text not null,
  labels text[] not null default '{}'::text[],
  assignees text[] not null default '{}'::text[],
  comments_count integer not null default 0,
  created_at timestamptz,
  updated_at timestamptz,
  claim_status text not null default 'unknown',
  last_scanned_at timestamptz not null default now()
);

create table if not exists public.github_repository_analysis (
  repository_id uuid primary key references public.github_repositories (id) on delete cascade,
  languages text[] not null default '{}'::text[],
  technologies text[] not null default '{}'::text[],
  infrastructure text[] not null default '{}'::text[],
  uses_docker boolean not null default false,
  gpu_likely_required boolean not null default false,
  setup_files_found text[] not null default '{}'::text[],
  analysis_updated_at timestamptz not null default now()
);

create index if not exists github_repositories_last_scanned_idx on public.github_repositories (last_scanned_at);
create index if not exists github_issues_repository_id_idx on public.github_issues (repository_id);
create index if not exists github_issues_last_scanned_idx on public.github_issues (last_scanned_at);

alter table public.github_repositories enable row level security;
alter table public.github_issues enable row level security;
alter table public.github_repository_analysis enable row level security;

drop policy if exists "Authenticated can read github repositories" on public.github_repositories;
create policy "Authenticated can read github repositories"
  on public.github_repositories for select to authenticated using (true);

drop policy if exists "Authenticated can write github repositories" on public.github_repositories;
create policy "Authenticated can write github repositories"
  on public.github_repositories for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated can read github issues" on public.github_issues;
create policy "Authenticated can read github issues"
  on public.github_issues for select to authenticated using (true);

drop policy if exists "Authenticated can write github issues" on public.github_issues;
create policy "Authenticated can write github issues"
  on public.github_issues for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated can read github analysis" on public.github_repository_analysis;
create policy "Authenticated can read github analysis"
  on public.github_repository_analysis for select to authenticated using (true);

drop policy if exists "Authenticated can write github analysis" on public.github_repository_analysis;
create policy "Authenticated can write github analysis"
  on public.github_repository_analysis for all to authenticated using (true) with check (true);

grant select, insert, update, delete on table public.github_repositories to authenticated;
grant select, insert, update, delete on table public.github_issues to authenticated;
grant select, insert, update, delete on table public.github_repository_analysis to authenticated;
