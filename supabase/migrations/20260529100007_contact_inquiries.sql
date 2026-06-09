-- ============================================================
-- Jobars Events — Contact inquiries table
-- ============================================================

create table if not exists public.contact_inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

drop policy if exists "all_insert_contact_inquiries" on public.contact_inquiries;
create policy "all_insert_contact_inquiries" on public.contact_inquiries
  for insert with check (true);

drop policy if exists "admin_read_contact_inquiries" on public.contact_inquiries;
create policy "admin_read_contact_inquiries" on public.contact_inquiries
  for select using (public.is_admin_only());
