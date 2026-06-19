-- Enforce per-user isolation for documents, exams, and chat.

alter table public.documents enable row level security;
alter table public.exams enable row level security;
alter table public.chat_messages enable row level security;

alter table public.documents force row level security;
alter table public.exams force row level security;
alter table public.chat_messages force row level security;

drop policy if exists "documents_owner_all" on public.documents;
create policy "documents_owner_all" on public.documents
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "exams_owner_all" on public.exams;
create policy "exams_owner_all" on public.exams
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "chat_owner_all" on public.chat_messages;
create policy "chat_owner_all" on public.chat_messages
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage: users may only access objects under their own folder ({user_id}/...)
do $$
begin
  if exists (
    select 1 from pg_class
    where relname = 'objects'
      and relnamespace = (select oid from pg_namespace where nspname = 'storage')
  ) then
    drop policy if exists "documents_owner_rw" on storage.objects;
    create policy "documents_owner_rw" on storage.objects
      for all
      to authenticated
      using (
        bucket_id = 'documents'
        and auth.uid()::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'documents'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "exports_owner_rw" on storage.objects;
    create policy "exports_owner_rw" on storage.objects
      for all
      to authenticated
      using (
        bucket_id = 'exports'
        and auth.uid()::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'exports'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;
