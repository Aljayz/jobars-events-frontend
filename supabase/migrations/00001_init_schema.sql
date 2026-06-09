-- ============================================================
-- Jobars Events — Database Schema (Phase 1)
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp"   with schema extensions;
create extension if not exists "pgcrypto"    with schema extensions;

-- ============================================================
-- 1. ENUMS
-- ============================================================
create type user_role as enum ('client', 'admin', 'manager', 'staff');
create type booking_status as enum ('pending', 'approved', 'in_progress', 'completed', 'cancelled');
create type service_category as enum (
  'catering',
  'sound_system',
  'photo_video',
  'photo_booth',
  'souvenirs',
  'invitations',
  'lights',
  'styling',
  'makeup',
  'host'
);

-- ============================================================
-- 2. TABLES
-- ============================================================

-- 2.1 profiles
create table if not exists public.profiles (
  id            uuid        primary key default gen_random_uuid(),
  email         text        unique not null,
  full_name     text        not null,
  avatar_url    text,
  phone         text,
  role          user_role   not null default 'client',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- profiles is the core identity table; auth.users is separate.
-- We link via a trigger or app-side on sign-up.

-- 2.2 events_bookings
create table if not exists public.events_bookings (
  id            uuid            primary key default gen_random_uuid(),
  client_id     uuid            not null references public.profiles(id) on delete cascade,
  event_type    text            not null default 'wedding',
  event_date    date            not null,
  venue         text,
  package_name  text,
  budget        numeric(12,2),
  head_count    int,
  status        booking_status  not null default 'pending',
  notes         text,
  created_at    timestamptz     not null default now(),
  updated_at    timestamptz     not null default now()
);
create index idx_events_bookings_client on public.events_bookings(client_id);
create index idx_events_bookings_status on public.events_bookings(status);

-- 2.3 services (static directory)
create table if not exists public.services (
  id            uuid             primary key default gen_random_uuid(),
  name          text             not null,
  category      service_category not null,
  description   text,
  base_price    numeric(10,2),
  is_active     boolean          not null default true,
  created_at    timestamptz      not null default now()
);

-- 2.4 booking_services (junction: event <-> services)
create table if not exists public.booking_services (
  id            uuid         primary key default gen_random_uuid(),
  booking_id    uuid         not null references public.events_bookings(id) on delete cascade,
  service_id    uuid         not null references public.services(id) on delete cascade,
  quantity      int          not null default 1,
  price         numeric(10,2),
  notes         text,
  created_at    timestamptz  not null default now(),
  unique(booking_id, service_id)
);
create index idx_booking_services_booking on public.booking_services(booking_id);

-- 2.5 staff_assignments
create table if not exists public.staff_assignments (
  id                uuid         primary key default gen_random_uuid(),
  booking_service_id uuid        not null references public.booking_services(id) on delete cascade,
  staff_id          uuid         not null references public.profiles(id) on delete cascade,
  role_description  text,
  assigned_at       timestamptz  not null default now(),
  unique(booking_service_id, staff_id)
);
create index idx_staff_assignments_staff on public.staff_assignments(staff_id);

-- ============================================================
-- 3. CHAT TABLES
-- ============================================================

-- 3.1 chat_rooms
create table if not exists public.chat_rooms (
  id            uuid         primary key default gen_random_uuid(),
  booking_id    uuid         not null references public.events_bookings(id) on delete cascade,
  name          text         not null,  -- e.g. "Juan & Maria Wedding Chat"
  is_active     boolean      not null default true,
  created_at    timestamptz  not null default now()
);
create index idx_chat_rooms_booking on public.chat_rooms(booking_id);

-- 3.2 chat_participants
create table if not exists public.chat_participants (
  id            uuid         primary key default gen_random_uuid(),
  chat_room_id   uuid        not null references public.chat_rooms(id) on delete cascade,
  profile_id    uuid         not null references public.profiles(id) on delete cascade,
  joined_at     timestamptz  not null default now(),
  unique(chat_room_id, profile_id)
);
create index idx_chat_participants_room   on public.chat_participants(chat_room_id);
create index idx_chat_participants_profile on public.chat_participants(profile_id);

-- 3.3 messages
create table if not exists public.messages (
  id            uuid         primary key default gen_random_uuid(),
  chat_room_id   uuid        not null references public.chat_rooms(id) on delete cascade,
  sender_id     uuid         not null references public.profiles(id) on delete cascade,
  content       text         not null,
  created_at    timestamptz  not null default now()
);
create index idx_messages_room on public.messages(chat_room_id);
create index idx_messages_created_at on public.messages(created_at);

-- ============================================================
-- 4. STORAGE BUCKETS (run in dashboard or via SQL)
-- ============================================================
-- These are created via the Supabase Dashboard or SQL:
--   select storage.create_bucket('invitation-proofs',  public => false);
--   select storage.create_bucket('media-previews',     public => false);

-- ============================================================
-- 5. UPDATED_AT TRIGGER (generic)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_events_bookings_updated_at
  before update on public.events_bookings
  for each row execute function public.set_updated_at();

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- 6.1 Enable RLS on all tables
alter table public.profiles           enable row level security;
alter table public.events_bookings    enable row level security;
alter table public.services           enable row level security;
alter table public.booking_services   enable row level security;
alter table public.staff_assignments  enable row level security;
alter table public.chat_rooms         enable row level security;
alter table public.chat_participants  enable row level security;
alter table public.messages           enable row level security;

-- 6.2 Profiles
-- Everyone can read their own profile; admins read all.
drop policy if exists "users_read_own_profile" on public.profiles;
create policy "users_read_own_profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "admins_read_all_profiles" on public.profiles;
create policy "admins_read_all_profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- Users update own profile (non-role fields)
drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- 6.3 Events Bookings
-- Clients see only their own bookings.
drop policy if exists "clients_read_own_bookings" on public.events_bookings;
create policy "clients_read_own_bookings" on public.events_bookings
  for select using (client_id = auth.uid());

-- Admins / managers see all bookings.
drop policy if exists "staff_read_all_bookings" on public.events_bookings;
create policy "staff_read_all_bookings" on public.events_bookings
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- Staff see bookings they are assigned to via staff_assignments.
drop policy if exists "assigned_staff_read_bookings" on public.events_bookings;
create policy "assigned_staff_read_bookings" on public.events_bookings
  for select using (
    exists (
      select 1 from public.staff_assignments sa
      join public.booking_services bs on bs.id = sa.booking_service_id
      where bs.booking_id = events_bookings.id and sa.staff_id = auth.uid()
    )
  );

-- Admins / managers can insert / update bookings.
drop policy if exists "admin_manage_bookings" on public.events_bookings;
create policy "admin_manage_bookings" on public.events_bookings
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

drop policy if exists "admin_update_bookings" on public.events_bookings;
create policy "admin_update_bookings" on public.events_bookings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- 6.4 Services (read-only for all authenticated users)
drop policy if exists "all_read_services" on public.services;
create policy "all_read_services" on public.services
  for select using (true);

-- 6.5 Booking Services
-- Clients see booking_services related to their bookings.
drop policy if exists "client_read_booking_services" on public.booking_services;
create policy "client_read_booking_services" on public.booking_services
  for select using (
    exists (select 1 from public.events_bookings where id = booking_services.booking_id and client_id = auth.uid())
  );

-- Staff see booking_services they are assigned to.
drop policy if exists "staff_read_assigned_booking_services" on public.booking_services;
create policy "staff_read_assigned_booking_services" on public.booking_services
  for select using (
    exists (select 1 from public.staff_assignments where booking_service_id = booking_services.id and staff_id = auth.uid())
  );

-- Admins manage all.
drop policy if exists "admin_manage_booking_services" on public.booking_services;
create policy "admin_manage_booking_services" on public.booking_services
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- 6.6 Staff Assignments
-- Staff see only their own assignments.
drop policy if exists "staff_read_own_assignments" on public.staff_assignments;
create policy "staff_read_own_assignments" on public.staff_assignments
  for select using (staff_id = auth.uid());

-- Admins manage all.
drop policy if exists "admin_manage_assignments" on public.staff_assignments;
create policy "admin_manage_assignments" on public.staff_assignments
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- ============================================================
-- 7. CHAT RLS (THE CRITICAL RULES)
-- ============================================================

-- 7.1 Chat Rooms
-- A user can see a chat room only if they are a participant.
drop policy if exists "participant_read_chat_rooms" on public.chat_rooms;
create policy "participant_read_chat_rooms" on public.chat_rooms
  for select using (
    exists (select 1 from public.chat_participants where chat_room_id = chat_rooms.id and profile_id = auth.uid())
  );

-- 7.2 Chat Participants
-- A user can see participant list only for rooms they belong to.
drop policy if exists "participant_read_chat_participants" on public.chat_participants;
create policy "participant_read_chat_participants" on public.chat_participants
  for select using (
    exists (select 1 from public.chat_participants cp2 where cp2.chat_room_id = chat_participants.chat_room_id and cp2.profile_id = auth.uid())
  );

-- 7.3 Messages — THE KEY POLICY
-- Users can read messages only in rooms they are participants of.
drop policy if exists "participant_read_messages" on public.messages;
create policy "participant_read_messages" on public.messages
  for select using (
    exists (select 1 from public.chat_participants where chat_room_id = messages.chat_room_id and profile_id = auth.uid())
  );

-- Users can insert messages only in rooms they are participants of, and only as themselves.
drop policy if exists "participant_insert_messages" on public.messages;
create policy "participant_insert_messages" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.chat_participants where chat_room_id = messages.chat_room_id and profile_id = auth.uid())
  );

-- Users can update/delete only their own messages.
drop policy if exists "participant_update_own_messages" on public.messages;
create policy "participant_update_own_messages" on public.messages
  for update using (sender_id = auth.uid());

drop policy if exists "participant_delete_own_messages" on public.messages;
create policy "participant_delete_own_messages" on public.messages
  for delete using (sender_id = auth.uid());

-- ============================================================
-- 8. STORAGE RLS
-- ============================================================
-- These policies are applied via Supabase Dashboard for the buckets:
-- invitation-proofs, media-previews

-- Example policy (run in SQL editor after creating buckets):
--   create policy "assigned_staff_read_invitation_proofs"
--     on storage.objects for select using (
--       bucket_id = 'invitation-proofs'
--       and exists (
--         select 1 from public.staff_assignments sa
--         join public.booking_services bs on bs.id = sa.booking_service_id
--         join public.events_bookings eb on eb.id = bs.booking_id
--         where sa.staff_id = auth.uid()
--           and storage.foldername(name)::text = eb.id::text
--       )
--     );
