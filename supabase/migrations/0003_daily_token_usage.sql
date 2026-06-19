-- Daily per-user token usage (replaces session-based tracking)
create table if not exists public.user_daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  tokens_used bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date)
);

create index if not exists user_daily_usage_user_date_idx
  on public.user_daily_usage(user_id, usage_date desc);

alter table public.user_daily_usage enable row level security;

drop policy if exists "daily_usage_owner_select" on public.user_daily_usage;
create policy "daily_usage_owner_select" on public.user_daily_usage
  for select using (auth.uid() = user_id);

-- Drop session-based table if the earlier migration was applied
drop table if exists public.user_session_usage;
