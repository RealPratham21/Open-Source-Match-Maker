-- Minimal per-user persistence for saved issues and recommendation history.

create table if not exists public.user_issue_states (
  user_id uuid not null references auth.users (id) on delete cascade,
  github_issue_id bigint not null,
  status text not null check (status in ('saved', 'dismissed', 'considering', 'working', 'completed')),
  notes text,
  recommendation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, github_issue_id)
);

create table if not exists public.discovery_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.recommendation_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.discovery_runs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  github_issue_id bigint not null,
  rank integer not null check (rank > 0),
  total_score integer not null,
  score_breakdown jsonb not null default '{}'::jsonb,
  recommendation jsonb not null,
  candidate jsonb not null,
  created_at timestamptz not null default now(),
  unique (run_id, github_issue_id)
);

drop trigger if exists user_issue_states_set_updated_at on public.user_issue_states;
create trigger user_issue_states_set_updated_at
  before update on public.user_issue_states
  for each row execute procedure public.set_updated_at();

create index if not exists user_issue_states_status_idx
  on public.user_issue_states (user_id, status, updated_at desc);
create index if not exists discovery_runs_user_idx
  on public.discovery_runs (user_id, created_at desc);
create index if not exists recommendation_items_user_issue_idx
  on public.recommendation_items (user_id, github_issue_id, created_at desc);
create index if not exists recommendation_items_run_rank_idx
  on public.recommendation_items (run_id, rank);

alter table public.user_issue_states enable row level security;
alter table public.discovery_runs enable row level security;
alter table public.recommendation_items enable row level security;

drop policy if exists "Users manage own issue states" on public.user_issue_states;
create policy "Users manage own issue states"
  on public.user_issue_states for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own discovery runs" on public.discovery_runs;
create policy "Users manage own discovery runs"
  on public.discovery_runs for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own recommendations" on public.recommendation_items;
create policy "Users manage own recommendations"
  on public.recommendation_items for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.user_issue_states to authenticated;
grant select, insert, update, delete on table public.discovery_runs to authenticated;
grant select, insert, update, delete on table public.recommendation_items to authenticated;

