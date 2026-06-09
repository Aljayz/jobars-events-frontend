-- ============================================================
-- Jobars Events — Milestones & Approvals (Phase 3)
-- ============================================================

-- 1. event_milestones — checklist items per booking
create table if not exists public.event_milestones (
  id            uuid         primary key default gen_random_uuid(),
  booking_id    uuid         not null references public.events_bookings(id) on delete cascade,
  title         text         not null,
  description   text,
  due_date      date,
  sort_order    int          not null default 0,
  is_completed  boolean      not null default false,
  completed_at  timestamptz,
  created_at    timestamptz  not null default now()
);
create index idx_event_milestones_booking on public.event_milestones(booking_id);

-- 2. approval_items — proof reviews (invitations, photos, etc.)
create type approval_status as enum ('pending', 'approved', 'revision_requested');

create table if not exists public.approval_items (
  id            uuid             primary key default gen_random_uuid(),
  booking_id    uuid             not null references public.events_bookings(id) on delete cascade,
  title         text             not null,
  description   text,
  file_url      text,             -- Supabase Storage URL
  file_type     text,             -- 'invitation', 'photo', 'video_preview'
  status        approval_status  not null default 'pending',
  feedback      text,
  created_at    timestamptz      not null default now(),
  updated_at    timestamptz      not null default now()
);
create index idx_approval_items_booking on public.approval_items(booking_id);

-- 3. Updated_at trigger for approval_items
create trigger trg_approval_items_updated_at
  before update on public.approval_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS for new tables
-- ============================================================
alter table public.event_milestones enable row level security;
alter table public.approval_items   enable row level security;

-- Event Milestones: clients see their own, admin sees all, staff see assigned
drop policy if exists "client_read_own_milestones" on public.event_milestones;
create policy "client_read_own_milestones" on public.event_milestones
  for select using (
    exists (select 1 from public.events_bookings where id = event_milestones.booking_id and client_id = auth.uid())
  );

drop policy if exists "admin_manage_milestones" on public.event_milestones;
create policy "admin_manage_milestones" on public.event_milestones
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- Clients can update their own milestones (checking off items)
drop policy if exists "client_update_own_milestones" on public.event_milestones;
create policy "client_update_own_milestones" on public.event_milestones
  for update using (
    exists (select 1 from public.events_bookings where id = event_milestones.booking_id and client_id = auth.uid())
  );

-- Approval Items: clients see their own, staff see assigned, admin see all
drop policy if exists "client_read_own_approvals" on public.approval_items;
create policy "client_read_own_approvals" on public.approval_items
  for select using (
    exists (select 1 from public.events_bookings where id = approval_items.booking_id and client_id = auth.uid())
  );

drop policy if exists "client_update_own_approvals" on public.approval_items;
create policy "client_update_own_approvals" on public.approval_items
  for update using (
    exists (select 1 from public.events_bookings where id = approval_items.booking_id and client_id = auth.uid())
  );

drop policy if exists "staff_read_assigned_approvals" on public.approval_items;
create policy "staff_read_assigned_approvals" on public.approval_items
  for select using (
    exists (select 1 from public.staff_assignments sa
      join public.booking_services bs on bs.id = sa.booking_service_id
      where bs.booking_id = approval_items.booking_id and sa.staff_id = auth.uid())
  );

drop policy if exists "staff_insert_approvals" on public.approval_items;
create policy "staff_insert_approvals" on public.approval_items
  for insert with check (
    exists (select 1 from public.staff_assignments sa
      join public.booking_services bs on bs.id = sa.booking_service_id
      where bs.booking_id = approval_items.booking_id and sa.staff_id = auth.uid())
  );

drop policy if exists "admin_manage_approvals" on public.approval_items;
create policy "admin_manage_approvals" on public.approval_items
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );
