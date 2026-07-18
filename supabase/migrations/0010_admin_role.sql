-- Persist super-admin as a DB flag. SUPER_ADMIN_EMAILS remains a bootstrap
-- allowlist in the API (promotes matching emails to is_admin=true); authorization
-- decisions read this column, not the JWT email alone.

alter table public.app_users
  add column if not exists is_admin boolean not null default false;

comment on column public.app_users.is_admin is
  'Super-admin dashboard access. Writable only via service role; authenticated clients cannot flip this flag.';

-- Defense in depth: authenticated JWTs cannot change is_admin even if an
-- UPDATE policy is added later.
create or replace function public.enforce_immutable_admin_flag()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'authenticated'
     and new.is_admin is distinct from old.is_admin then
    raise exception 'app_users.is_admin is immutable for clients';
  end if;
  return new;
end;
$$;

drop trigger if exists app_users_immutable_admin on public.app_users;
create trigger app_users_immutable_admin
  before update on public.app_users
  for each row
  execute function public.enforce_immutable_admin_flag();
