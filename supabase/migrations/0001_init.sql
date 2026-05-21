-- Exam Generator initial schema

create extension if not exists "pgcrypto";

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  extracted_text text,
  created_at timestamptz not null default now()
);
create index if not exists documents_user_idx on public.documents(user_id, created_at desc);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  title text,
  spec jsonb not null default '{}'::jsonb,
  content jsonb,
  export_format text check (export_format in ('pdf','docx')),
  export_path text,
  status text not null default 'pending'
    check (status in ('pending','generating','ready','error')),
  created_at timestamptz not null default now()
);
create index if not exists exams_user_idx on public.exams(user_id, created_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('document','exam')),
  scope_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_scope_idx
  on public.chat_messages(user_id, scope, scope_id, created_at);

-- RLS
alter table public.documents enable row level security;
alter table public.exams enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "documents_owner_all" on public.documents;
create policy "documents_owner_all" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "exams_owner_all" on public.exams;
create policy "exams_owner_all" on public.exams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "chat_owner_all" on public.chat_messages;
create policy "chat_owner_all" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage buckets (run manually in Supabase if not present):
--   insert into storage.buckets (id, name, public) values ('documents','documents',false) on conflict do nothing;
--   insert into storage.buckets (id, name, public) values ('exports','exports',false) on conflict do nothing;
--
-- Storage RLS policies (objects keyed under {user_id}/...):
do $$
begin
  if exists (select 1 from pg_class where relname='objects' and relnamespace=(select oid from pg_namespace where nspname='storage')) then
    -- documents bucket
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='documents_owner_rw') then
      create policy "documents_owner_rw" on storage.objects for all
        using (
          bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
        )
        with check (
          bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
        );
    end if;
    -- exports bucket
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='exports_owner_rw') then
      create policy "exports_owner_rw" on storage.objects for all
        using (
          bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]
        )
        with check (
          bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]
        );
    end if;
  end if;
end $$;
