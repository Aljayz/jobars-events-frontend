-- ============================================================
-- Jobars Events — Reschedule Requests Table
-- ============================================================

create table if not exists public.reschedule_requests (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.events_bookings(id) on delete cascade,
  client_id       uuid not null references public.profiles(id),
  original_date   date not null,
  requested_date  date not null,
  reason          text,
  status          text not null default 'pending',
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_reschedule_booking on public.reschedule_requests(booking_id);
create index if not exists idx_reschedule_status on public.reschedule_requests(status);

alter table public.reschedule_requests enable row level security;

-- Client: insert own requests
drop policy if exists "client_insert_reschedule" on public.reschedule_requests;
create policy "client_insert_reschedule" on public.reschedule_requests
  for insert with check (client_id = auth.uid());

-- Client: read own requests
drop policy if exists "client_read_own_reschedule" on public.reschedule_requests;
create policy "client_read_own_reschedule" on public.reschedule_requests
  for select using (client_id = auth.uid());

-- Admin: read all
drop policy if exists "admin_read_reschedule" on public.reschedule_requests;
create policy "admin_read_reschedule" on public.reschedule_requests
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role::text in ('admin', 'super-admin', 'manager'))
  );

-- Admin: update (approve/deny)
drop policy if exists "admin_update_reschedule" on public.reschedule_requests;
create policy "admin_update_reschedule" on public.reschedule_requests
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role::text in ('admin', 'super-admin', 'manager'))
  );
