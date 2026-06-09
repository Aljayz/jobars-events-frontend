-- ============================================================
-- Jobars Events — In-App Notifications
-- ============================================================

create table if not exists public.notifications (
  id            uuid         primary key default gen_random_uuid(),
  profile_id    uuid         not null references public.profiles(id) on delete cascade,
  title         text         not null,
  message       text,
  type          text         not null default 'general',  -- 'milestone', 'approval', 'booking'
  link          text,                                      -- link to relevant page
  is_read       boolean      not null default false,
  created_at    timestamptz  not null default now()
);

create index if not exists idx_notifications_profile on public.notifications(profile_id);
create index if not exists idx_notifications_unread on public.notifications(profile_id, is_read);

alter table public.notifications enable row level security;

-- Users see their own notifications
drop policy if exists "read_own_notifications" on public.notifications;
create policy "read_own_notifications" on public.notifications
  for select using (profile_id = auth.uid());

-- Users can mark their own as read
drop policy if exists "update_own_notifications" on public.notifications;
create policy "update_own_notifications" on public.notifications
  for update using (profile_id = auth.uid());

-- Server can insert (via triggers/actions)
drop policy if exists "insert_notifications" on public.notifications;
create policy "insert_notifications" on public.notifications
  for insert with check (true);
