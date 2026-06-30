-- Switch usage model from a divided token pool to:
--   * a fixed per-user daily EXAM quota (exam_count), and
--   * USD cost metering (cost_usd) for the global circuit breaker + admin dashboard.

-- Track the user's email so the super-admin dashboard can label rankings.
alter table public.app_users
  add column if not exists email text;

-- Per-day, per-user counters.
alter table public.user_daily_usage
  add column if not exists exam_count integer not null default 0;

alter table public.user_daily_usage
  add column if not exists cost_usd numeric(12, 6) not null default 0;
