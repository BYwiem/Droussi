-- Lock down client-side mutations on documents/exams and freeze sensitive
-- path columns. The SPA should SELECT only; inserts/updates go through the
-- service-role API. Path columns are immutable for authenticated clients so a
-- poisoned storage_path / export_path cannot be written even if RLS is later
-- loosened.

-- 1. documents / exams: authenticated may SELECT only (no INSERT/UPDATE/DELETE).
-- Drop both old FOR ALL and any prior SELECT policies so this file is re-runnable.
drop policy if exists "documents_owner_all" on public.documents;
drop policy if exists "documents_owner_select" on public.documents;
create policy "documents_owner_select" on public.documents
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "exams_owner_all" on public.exams;
drop policy if exists "exams_owner_select" on public.exams;
create policy "exams_owner_select" on public.exams
  for select
  to authenticated
  using (auth.uid() = user_id);

-- chat_messages is unused by the SPA today; keep SELECT-only for consistency.
drop policy if exists "chat_owner_all" on public.chat_messages;
drop policy if exists "chat_owner_select" on public.chat_messages;
create policy "chat_owner_select" on public.chat_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 2. Freeze sensitive columns for authenticated JWT callers (defense in depth
--    if an UPDATE policy is ever re-added). Service role / SQL migrations are
--    unaffected. Client INSERT/UPDATE/DELETE are already blocked by RLS above.
create or replace function public.enforce_immutable_storage_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' then
    return new;
  end if;

  if tg_table_name = 'documents' then
    if new.storage_path is distinct from old.storage_path
       or new.extracted_text is distinct from old.extracted_text then
      raise exception 'documents.storage_path and extracted_text are immutable';
    end if;
  elsif tg_table_name = 'exams' then
    if new.export_path is distinct from old.export_path then
      raise exception 'exams.export_path is immutable';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists documents_immutable_storage on public.documents;
create trigger documents_immutable_storage
  before update on public.documents
  for each row
  execute function public.enforce_immutable_storage_columns();

drop trigger if exists exams_immutable_storage on public.exams;
create trigger exams_immutable_storage
  before update on public.exams
  for each row
  execute function public.enforce_immutable_storage_columns();

-- 3. Atomic exam-credit reservation (check + increment in one statement).
--    Callers reserve before the LLM call and refund on hard failure.
create or replace function public.reserve_exam_credit(
  p_user_id uuid,
  p_limit integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_today date := (timezone('utc', now()))::date;
begin
  if coalesce(p_limit, 0) <= 0 then
    raise exception 'EXAM_QUOTA_EXCEEDED'
      using errcode = 'P0001';
  end if;

  insert into public.user_daily_usage (user_id, usage_date, exam_count, cost_usd)
  values (p_user_id, v_today, 1, 0)
  on conflict (user_id, usage_date) do update
    set exam_count = public.user_daily_usage.exam_count + 1,
        updated_at = now()
    where public.user_daily_usage.exam_count < p_limit
  returning exam_count into v_count;

  if v_count is null then
    raise exception 'EXAM_QUOTA_EXCEEDED'
      using errcode = 'P0001';
  end if;

  return v_count;
end;
$$;

create or replace function public.refund_exam_credit(
  p_user_id uuid
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_today date := (timezone('utc', now()))::date;
begin
  update public.user_daily_usage
  set exam_count = greatest(exam_count - 1, 0),
      updated_at = now()
  where user_id = p_user_id
    and usage_date = v_today
  returning exam_count into v_count;

  return coalesce(v_count, 0);
end;
$$;

revoke all on function public.reserve_exam_credit(uuid, integer) from public;
revoke all on function public.reserve_exam_credit(uuid, integer) from anon;
revoke all on function public.reserve_exam_credit(uuid, integer) from authenticated;

revoke all on function public.refund_exam_credit(uuid) from public;
revoke all on function public.refund_exam_credit(uuid) from anon;
revoke all on function public.refund_exam_credit(uuid) from authenticated;
