-- ============================================================
-- Jobars Events — Storage Bucket for Approval Files
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'approval_files',
  'approval_files',
  true,
  10485760,  -- 10MB
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

-- Allow authenticated users to read files
drop policy if exists "authenticated_read" on storage.objects;
create policy "authenticated_read" on storage.objects
  for select
  to authenticated
  using (bucket_id = 'approval_files');

-- Allow admins/managers to insert files
drop policy if exists "admin_insert" on storage.objects;
create policy "admin_insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'approval_files'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Allow admins/managers to delete files
drop policy if exists "admin_delete" on storage.objects;
create policy "admin_delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'approval_files'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );
