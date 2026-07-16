-- Subscription / billing fields on app_users.
-- Plan is written only by the backend (service role) via Lemon Squeezy webhooks.
-- Clients may SELECT their own row (existing RLS); they cannot UPDATE plan.

alter table public.app_users
  add column if not exists plan text not null default 'free';

alter table public.app_users
  add column if not exists subscription_status text;

alter table public.app_users
  add column if not exists subscription_id text;

alter table public.app_users
  add column if not exists provider_customer_id text;

alter table public.app_users
  add column if not exists current_period_end timestamptz;

-- Valid plans today: free | pro. Keep as text so future tiers don't need a migration.
comment on column public.app_users.plan is
  'Subscription tier: free | pro. Enforced by backend quota / model gating.';

create index if not exists app_users_subscription_id_idx
  on public.app_users (subscription_id)
  where subscription_id is not null;
