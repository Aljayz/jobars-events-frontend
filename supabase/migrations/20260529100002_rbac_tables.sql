-- ============================================================
-- Jobars Events — RBAC Extensions (Phase 2)
-- New roles: super-admin, human-resource, employee, external-client
-- New features: mode switching, locations, HR, attendance, etc.
-- ============================================================

-- ============================================================
-- 1. NEW ENUMS
-- ============================================================
do $$ begin
  create type attendance_event as enum ('login', 'logout', 'clock_in', 'clock_out');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type location_request_status as enum ('pending', 'approved', 'denied');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type promotion_type as enum ('employee_to_staff');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 2. PROFILE EXTENSIONS
-- ============================================================
alter table public.profiles
  add column if not exists client_mode     boolean not null default false,
  add column if not exists hr_privilege    text check (hr_privilege in ('admin', 'manager'));

-- Note: existing 'client' role users are handled in proxy.ts
-- New sign-ups will get 'external-client' via the updated auto-profile trigger below

-- ============================================================
-- 3. NEW TABLES
-- ============================================================

-- 3.1 Business Locations
create table if not exists public.business_locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text not null,
  latitude    double precision,
  longitude   double precision,
  is_primary  boolean not null default false,
  updated_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3.2 Location Update Requests (manager → admin approval)
create table if not exists public.location_update_requests (
  id            uuid primary key default gen_random_uuid(),
  requested_by  uuid not null references public.profiles(id),
  location_id   uuid references public.business_locations(id),
  name          text not null,
  address       text not null,
  latitude      double precision,
  longitude     double precision,
  reason        text,
  status        location_request_status not null default 'pending',
  reviewed_by   uuid references public.profiles(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- 3.3 Permanent Location Permissions (admin grants manager ability to update location without approval)
create table if not exists public.permanent_location_permissions (
  id            uuid primary key default gen_random_uuid(),
  manager_id    uuid not null references public.profiles(id) unique,
  granted_by    uuid not null references public.profiles(id),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- 3.4 Attendance Logs
create table if not exists public.attendance_logs (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.profiles(id),
  event         attendance_event not null,
  timestamp     timestamptz not null default now(),
  confirmed_by  uuid references public.profiles(id),
  confirmed_at  timestamptz,
  service_id    uuid references public.services(id),
  notes         text
);
create index if not exists idx_attendance_logs_employee on public.attendance_logs(employee_id);
create index if not exists idx_attendance_logs_event on public.attendance_logs(event);

-- 3.5 Salary Records
create table if not exists public.salary_records (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.profiles(id),
  base_salary   numeric(10,2) not null,
  pay_period    daterange not null,
  total_hours   numeric(6,2),
  adjustments   numeric(10,2) default 0,
  net_pay       numeric(10,2),
  status        text not null default 'pending',
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_salary_records_employee on public.salary_records(employee_id);

-- 3.6 Cash Advance Requests
create table if not exists public.cash_advance_requests (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.profiles(id),
  amount        numeric(10,2) not null,
  reason        text,
  status        text not null default 'pending',
  reviewed_by   uuid references public.profiles(id),
  reviewed_at   timestamptz,
  released_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_cash_advance_employee on public.cash_advance_requests(employee_id);

-- 3.7 Promotion Recommendations
create table if not exists public.promotion_recommendations (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid not null references public.profiles(id),
  recommended_by  uuid not null references public.profiles(id),
  promotion_type  promotion_type not null,
  reason          text,
  status          text not null default 'pending',
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists idx_promotion_recs_status on public.promotion_recommendations(status);

-- 3.8 Employee Records (HR metadata)
create table if not exists public.employee_records (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references public.profiles(id) unique,
  employee_id       text unique,
  date_hired        date,
  department        text,
  position          text,
  emergency_contact text,
  emergency_phone   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 3.9 Service-Employee Assignments (for attendance confirmation)
create table if not exists public.service_employee_assignments (
  id              uuid primary key default gen_random_uuid(),
  service_id      uuid not null references public.services(id),
  employee_id     uuid not null references public.profiles(id),
  assigned_by     uuid not null references public.profiles(id),
  created_at      timestamptz not null default now(),
  unique(service_id, employee_id)
);

-- 3.10 Client Conversion Requests (external-client → employee)
create table if not exists public.client_conversion_requests (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id),
  new_role        text not null default 'employee',
  created_by      uuid not null references public.profiles(id),
  status          text not null default 'completed',
  created_at      timestamptz not null default now()
);

-- 3.11 Meetup Bookings
create table if not exists public.meetup_bookings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id),
  meetup_date     timestamptz not null,
  purpose         text,
  status          text not null default 'pending',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3.12 Event Ratings
create table if not exists public.event_ratings (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.events_bookings(id) on delete cascade,
  client_id       uuid not null references public.profiles(id),
  rating          int not null check (rating >= 1 and rating <= 5),
  review          text,
  created_at      timestamptz not null default now(),
  unique(booking_id, client_id)
);

-- ============================================================
-- 4. UPDATED_AT TRIGGERS
-- ============================================================
create trigger trg_business_locations_updated_at
  before update on public.business_locations
  for each row execute function public.set_updated_at();

create trigger trg_salary_records_updated_at
  before update on public.salary_records
  for each row execute function public.set_updated_at();

create trigger trg_employee_records_updated_at
  before update on public.employee_records
  for each row execute function public.set_updated_at();

create trigger trg_meetup_bookings_updated_at
  before update on public.meetup_bookings
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- 5.1 Enable RLS on all new tables
alter table public.business_locations           enable row level security;
alter table public.location_update_requests      enable row level security;
alter table public.permanent_location_permissions enable row level security;
alter table public.attendance_logs               enable row level security;
alter table public.salary_records                enable row level security;
alter table public.cash_advance_requests         enable row level security;
alter table public.promotion_recommendations     enable row level security;
alter table public.employee_records              enable row level security;
alter table public.service_employee_assignments  enable row level security;
alter table public.client_conversion_requests    enable row level security;
alter table public.meetup_bookings               enable row level security;
alter table public.event_ratings                 enable row level security;

-- ============================================================
-- 5.2 Helper: is_admin_or_above — includes super-admin, admin, manager, human-resource
-- ============================================================
create or replace function public.is_admin_or_above()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super-admin', 'admin', 'manager', 'human-resource')
  );
$$ language sql stable security definer;

-- ============================================================
-- 5.3 Helper: is_admin_only — only super-admin and admin
-- ============================================================
create or replace function public.is_admin_only()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super-admin', 'admin')
  );
$$ language sql stable security definer;

-- ============================================================
-- 5.4 Business Locations
-- ============================================================
drop policy if exists "all_read_locations" on public.business_locations;
create policy "all_read_locations" on public.business_locations
  for select using (true);

drop policy if exists "admin_manage_locations" on public.business_locations;
create policy "admin_manage_locations" on public.business_locations
  for all using (public.is_admin_only());

drop policy if exists "manager_update_locations" on public.business_locations;
create policy "manager_update_locations" on public.business_locations
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'super-admin'))
  );

-- ============================================================
-- 5.5 Location Update Requests
-- ============================================================
drop policy if exists "manager_insert_location_requests" on public.location_update_requests;
create policy "manager_insert_location_requests" on public.location_update_requests
  for insert with check (
    auth.uid() = requested_by
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('manager', 'admin', 'super-admin'))
  );

drop policy if exists "admin_read_all_location_requests" on public.location_update_requests;
create policy "admin_read_all_location_requests" on public.location_update_requests
  for select using (public.is_admin_only());

drop policy if exists "admin_update_location_requests" on public.location_update_requests;
create policy "admin_update_location_requests" on public.location_update_requests
  for update using (public.is_admin_only());

-- ============================================================
-- 5.6 Permanent Location Permissions
-- ============================================================
drop policy if exists "admin_manage_location_permissions" on public.permanent_location_permissions;
create policy "admin_manage_location_permissions" on public.permanent_location_permissions
  for all using (public.is_admin_only());

drop policy if exists "manager_read_own_permissions" on public.permanent_location_permissions;
create policy "manager_read_own_permissions" on public.permanent_location_permissions
  for select using (manager_id = auth.uid());

-- ============================================================
-- 5.7 Attendance Logs
-- ============================================================
drop policy if exists "employee_insert_own_attendance" on public.attendance_logs;
create policy "employee_insert_own_attendance" on public.attendance_logs
  for insert with check (employee_id = auth.uid());

drop policy if exists "employee_read_own_attendance" on public.attendance_logs;
create policy "employee_read_own_attendance" on public.attendance_logs
  for select using (employee_id = auth.uid());

drop policy if exists "admin_read_all_attendance" on public.attendance_logs;
create policy "admin_read_all_attendance" on public.attendance_logs
  for select using (public.is_admin_or_above());

drop policy if exists "staff_confirm_attendance" on public.attendance_logs;
create policy "staff_confirm_attendance" on public.attendance_logs
  for update using (public.is_admin_or_above());

-- ============================================================
-- 5.8 Salary Records
-- ============================================================
drop policy if exists "employee_read_own_salary" on public.salary_records;
create policy "employee_read_own_salary" on public.salary_records
  for select using (employee_id = auth.uid());

drop policy if exists "admin_manage_salary" on public.salary_records;
create policy "admin_manage_salary" on public.salary_records
  for all using (public.is_admin_or_above());

-- ============================================================
-- 5.9 Cash Advance Requests
-- ============================================================
drop policy if exists "employee_insert_own_cash_advance" on public.cash_advance_requests;
create policy "employee_insert_own_cash_advance" on public.cash_advance_requests
  for insert with check (employee_id = auth.uid());

drop policy if exists "employee_read_own_cash_advance" on public.cash_advance_requests;
create policy "employee_read_own_cash_advance" on public.cash_advance_requests
  for select using (employee_id = auth.uid());

drop policy if exists "admin_manage_cash_advance" on public.cash_advance_requests;
create policy "admin_manage_cash_advance" on public.cash_advance_requests
  for all using (public.is_admin_or_above());

-- ============================================================
-- 5.10 Promotion Recommendations
-- ============================================================
drop policy if exists "admin_hr_insert_promotion_recs" on public.promotion_recommendations;
create policy "admin_hr_insert_promotion_recs" on public.promotion_recommendations
  for insert with check (
    public.is_admin_or_above()
  );

drop policy if exists "admin_read_promotion_recs" on public.promotion_recommendations;
create policy "admin_read_promotion_recs" on public.promotion_recommendations
  for select using (public.is_admin_or_above());

drop policy if exists "employee_read_own_promotion_recs" on public.promotion_recommendations;
create policy "employee_read_own_promotion_recs" on public.promotion_recommendations
  for select using (employee_id = auth.uid());

drop policy if exists "admin_review_promotion_recs" on public.promotion_recommendations;
create policy "admin_review_promotion_recs" on public.promotion_recommendations
  for update using (public.is_admin_only());

-- ============================================================
-- 5.11 Employee Records
-- ============================================================
drop policy if exists "employee_read_own_record" on public.employee_records;
create policy "employee_read_own_record" on public.employee_records
  for select using (profile_id = auth.uid());

drop policy if exists "admin_manage_employee_records" on public.employee_records;
create policy "admin_manage_employee_records" on public.employee_records
  for all using (public.is_admin_or_above());

-- ============================================================
-- 5.12 Service-Employee Assignments
-- ============================================================
drop policy if exists "admin_manage_service_employee" on public.service_employee_assignments;
create policy "admin_manage_service_employee" on public.service_employee_assignments
  for all using (public.is_admin_or_above());

drop policy if exists "staff_read_service_employee" on public.service_employee_assignments;
create policy "staff_read_service_employee" on public.service_employee_assignments
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin', 'super-admin', 'manager', 'human-resource'))
  );

drop policy if exists "employee_read_own_assignments" on public.service_employee_assignments;
create policy "employee_read_own_assignments" on public.service_employee_assignments
  for select using (employee_id = auth.uid());

-- ============================================================
-- 5.13 Client Conversion Requests
-- ============================================================
drop policy if exists "admin_manage_client_conversion" on public.client_conversion_requests;
create policy "admin_manage_client_conversion" on public.client_conversion_requests
  for all using (public.is_admin_only());

-- ============================================================
-- 5.14 Meetup Bookings
-- ============================================================
drop policy if exists "client_manage_own_meetups" on public.meetup_bookings;
create policy "client_manage_own_meetups" on public.meetup_bookings
  for all using (client_id = auth.uid());

drop policy if exists "admin_read_all_meetups" on public.meetup_bookings;
create policy "admin_read_all_meetups" on public.meetup_bookings
  for select using (public.is_admin_or_above());

-- ============================================================
-- 5.15 Event Ratings
-- ============================================================
drop policy if exists "client_insert_own_ratings" on public.event_ratings;
create policy "client_insert_own_ratings" on public.event_ratings
  for insert with check (
    client_id = auth.uid()
    and exists (select 1 from public.events_bookings where id = booking_id and client_id = auth.uid())
  );

drop policy if exists "all_read_ratings" on public.event_ratings;
create policy "all_read_ratings" on public.event_ratings
  for select using (true);

-- ============================================================
-- 6. UPDATE EXISTING RLS POLICIES
-- ============================================================

-- 6.1 Profiles: include new roles for admin/manager reads
drop policy if exists "admins_read_all_profiles" on public.profiles;
create policy "admins_read_all_profiles" on public.profiles
  for select using (
    public.is_admin_or_above()
  );

-- 6.2 Events Bookings: include new roles
drop policy if exists "staff_read_all_bookings" on public.events_bookings;
create policy "staff_read_all_bookings" on public.events_bookings
  for select using (public.is_admin_or_above());

drop policy if exists "admin_manage_bookings" on public.events_bookings;
create policy "admin_manage_bookings" on public.events_bookings
  for insert with check (public.is_admin_or_above());

drop policy if exists "admin_update_bookings" on public.events_bookings;
create policy "admin_update_bookings" on public.events_bookings
  for update using (public.is_admin_or_above());

-- 6.3 Booking Services
drop policy if exists "admin_manage_booking_services" on public.booking_services;
create policy "admin_manage_booking_services" on public.booking_services
  for all using (public.is_admin_or_above());

-- 6.4 Staff Assignments
drop policy if exists "admin_manage_assignments" on public.staff_assignments;
create policy "admin_manage_assignments" on public.staff_assignments
  for all using (public.is_admin_or_above());

-- 6.5 Chat auto-provision trigger: include new roles
create or replace function public.provision_chat_room()
returns trigger as $$
declare
  v_chat_room_id uuid;
  v_staff record;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    insert into public.chat_rooms (booking_id, name)
    values (
      new.id,
      concat('Event Chat — Booking #', substr(new.id::text, 1, 8))
    )
    returning id into v_chat_room_id;

    insert into public.chat_participants (chat_room_id, profile_id)
    values (v_chat_room_id, new.client_id);

    insert into public.chat_participants (chat_room_id, profile_id)
    select v_chat_room_id, id
    from public.profiles
    where role in ('admin', 'manager', 'super-admin', 'human-resource')
      and id != new.client_id
      and not exists (
        select 1 from public.chat_participants
        where chat_room_id = v_chat_room_id and profile_id = profiles.id
      );

    for v_staff in
      select distinct sa.staff_id
      from public.staff_assignments sa
      join public.booking_services bs on bs.id = sa.booking_service_id
      where bs.booking_id = new.id
        and not exists (
          select 1 from public.chat_participants
          where chat_room_id = v_chat_room_id and profile_id = sa.staff_id
        )
    loop
      insert into public.chat_participants (chat_room_id, profile_id)
      values (v_chat_room_id, v_staff.staff_id);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 6.6 First-admin trigger: use 'super-admin' concept
create or replace function public.handle_first_admin()
returns trigger as $$
begin
  if not exists (select 1 from public.profiles where role in ('admin', 'super-admin')) then
    new.role = 'super-admin';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 6.7 Update auto-profile trigger: default to 'external-client'
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'external-client');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    v_role::public.user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;
