-- Per-user registration (for equal token-budget distribution)
create table if not exists public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_seen_at timestamptz not null default now()
);

-- Per-login-session token usage (superseded by 0003_daily_token_usage.sql)
create table if not exists public.user_session_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  tokens_used bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, session_id)
);

create index if not exists user_session_usage_user_idx
  on public.user_session_usage(user_id);

alter table public.app_users enable row level security;
alter table public.user_session_usage enable row level security;

drop policy if exists "app_users_owner_select" on public.app_users;
create policy "app_users_owner_select" on public.app_users
  for select using (auth.uid() = user_id);

drop policy if exists "session_usage_owner_select" on public.user_session_usage;
create policy "session_usage_owner_select" on public.user_session_usage
  for select using (auth.uid() = user_id);
