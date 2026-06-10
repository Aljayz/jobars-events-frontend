-- ============================================================
-- Jobars Events — Change profile IDs from uuid to text
-- ============================================================
-- Firebase Auth uses alphanumeric UID strings (not UUIDs), so
-- profiles.id and all FK references must be text.
-- ============================================================

-- 0. Drop all RLS policies on public and storage tables (they use
--    auth.uid() which is null with Firebase auth — broken anyway;
--    service role key bypasses RLS server-side)
do $$
declare
  rec record;
begin
  for rec in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname in ('public', 'storage')
  loop
    execute format('drop policy if exists %I on %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  end loop;
end;
$$;

-- 1. Drop all FK constraints referencing profiles(id)
alter table public.attendance_logs                     drop constraint if exists attendance_logs_confirmed_by_fkey;
alter table public.attendance_logs                     drop constraint if exists attendance_logs_employee_id_fkey;
alter table public.business_locations                  drop constraint if exists business_locations_updated_by_fkey;
alter table public.business_settings                   drop constraint if exists business_settings_updated_by_fkey;
alter table public.cash_advance_requests               drop constraint if exists cash_advance_requests_employee_id_fkey;
alter table public.cash_advance_requests               drop constraint if exists cash_advance_requests_reviewed_by_fkey;
alter table public.chat_participants                   drop constraint if exists chat_participants_profile_id_fkey;
alter table public.client_conversion_requests          drop constraint if exists client_conversion_requests_client_id_fkey;
alter table public.client_conversion_requests          drop constraint if exists client_conversion_requests_created_by_fkey;
alter table public.employee_records                    drop constraint if exists employee_records_profile_id_fkey;
alter table public.event_ratings                       drop constraint if exists event_ratings_client_id_fkey;
alter table public.events_bookings                     drop constraint if exists events_bookings_client_id_fkey;
alter table public.location_update_requests            drop constraint if exists location_update_requests_requested_by_fkey;
alter table public.location_update_requests            drop constraint if exists location_update_requests_reviewed_by_fkey;
alter table public.meetup_bookings                     drop constraint if exists meetup_bookings_client_id_fkey;
alter table public.messages                            drop constraint if exists messages_sender_id_fkey;
alter table public.notifications                       drop constraint if exists notifications_profile_id_fkey;
alter table public.permanent_location_permissions      drop constraint if exists permanent_location_permissions_granted_by_fkey;
alter table public.permanent_location_permissions      drop constraint if exists permanent_location_permissions_manager_id_fkey;
alter table public.promotion_recommendations            drop constraint if exists promotion_recommendations_employee_id_fkey;
alter table public.promotion_recommendations            drop constraint if exists promotion_recommendations_recommended_by_fkey;
alter table public.promotion_recommendations            drop constraint if exists promotion_recommendations_reviewed_by_fkey;
alter table public.reschedule_requests                 drop constraint if exists reschedule_requests_client_id_fkey;
alter table public.reschedule_requests                 drop constraint if exists reschedule_requests_reviewed_by_fkey;
alter table public.salary_records                      drop constraint if exists salary_records_employee_id_fkey;
alter table public.service_employee_assignments         drop constraint if exists service_employee_assignments_assigned_by_fkey;
alter table public.service_employee_assignments         drop constraint if exists service_employee_assignments_employee_id_fkey;
alter table public.staff_assignments                   drop constraint if exists staff_assignments_staff_id_fkey;

-- 2. Change profiles.id from uuid to text
alter table public.profiles alter column id type text;

-- 3. Change all FK columns from uuid to text
alter table public.attendance_logs                   alter column confirmed_by  type text;
alter table public.attendance_logs                   alter column employee_id  type text;
alter table public.business_locations                alter column updated_by   type text;
alter table public.business_settings                 alter column updated_by   type text;
alter table public.cash_advance_requests             alter column employee_id type text;
alter table public.cash_advance_requests             alter column reviewed_by type text;
alter table public.chat_participants                 alter column profile_id  type text;
alter table public.client_conversion_requests        alter column client_id   type text;
alter table public.client_conversion_requests        alter column created_by  type text;
alter table public.employee_records                  alter column profile_id  type text;
alter table public.event_ratings                     alter column client_id   type text;
alter table public.events_bookings                   alter column client_id   type text;
alter table public.location_update_requests          alter column requested_by type text;
alter table public.location_update_requests          alter column reviewed_by type text;
alter table public.meetup_bookings                   alter column client_id   type text;
alter table public.messages                          alter column sender_id   type text;
alter table public.notifications                     alter column profile_id  type text;
alter table public.permanent_location_permissions    alter column granted_by  type text;
alter table public.permanent_location_permissions    alter column manager_id  type text;
alter table public.promotion_recommendations          alter column employee_id    type text;
alter table public.promotion_recommendations          alter column recommended_by type text;
alter table public.promotion_recommendations          alter column reviewed_by   type text;
alter table public.reschedule_requests               alter column client_id    type text;
alter table public.reschedule_requests               alter column reviewed_by  type text;
alter table public.salary_records                    alter column employee_id type text;
alter table public.service_employee_assignments      alter column assigned_by  type text;
alter table public.service_employee_assignments      alter column employee_id type text;
alter table public.staff_assignments                 alter column staff_id    type text;

-- 4. Recreate FK constraints
alter table public.attendance_logs                   add constraint attendance_logs_confirmed_by_fkey  foreign key (confirmed_by) references public.profiles(id);
alter table public.attendance_logs                   add constraint attendance_logs_employee_id_fkey   foreign key (employee_id) references public.profiles(id);
alter table public.business_locations                add constraint business_locations_updated_by_fkey  foreign key (updated_by) references public.profiles(id);
alter table public.business_settings                 add constraint business_settings_updated_by_fkey   foreign key (updated_by) references public.profiles(id);
alter table public.cash_advance_requests             add constraint cash_advance_requests_employee_id_fkey  foreign key (employee_id) references public.profiles(id);
alter table public.cash_advance_requests             add constraint cash_advance_requests_reviewed_by_fkey  foreign key (reviewed_by) references public.profiles(id);
alter table public.chat_participants                 add constraint chat_participants_profile_id_fkey  foreign key (profile_id) references public.profiles(id);
alter table public.client_conversion_requests        add constraint client_conversion_requests_client_id_fkey   foreign key (client_id) references public.profiles(id);
alter table public.client_conversion_requests        add constraint client_conversion_requests_created_by_fkey  foreign key (created_by) references public.profiles(id);
alter table public.employee_records                  add constraint employee_records_profile_id_fkey     foreign key (profile_id) references public.profiles(id);
alter table public.event_ratings                     add constraint event_ratings_client_id_fkey         foreign key (client_id) references public.profiles(id);
alter table public.events_bookings                   add constraint events_bookings_client_id_fkey       foreign key (client_id) references public.profiles(id);
alter table public.location_update_requests          add constraint location_update_requests_requested_by_fkey  foreign key (requested_by) references public.profiles(id);
alter table public.location_update_requests          add constraint location_update_requests_reviewed_by_fkey   foreign key (reviewed_by) references public.profiles(id);
alter table public.meetup_bookings                   add constraint meetup_bookings_client_id_fkey       foreign key (client_id) references public.profiles(id);
alter table public.messages                          add constraint messages_sender_id_fkey              foreign key (sender_id) references public.profiles(id);
alter table public.notifications                     add constraint notifications_profile_id_fkey        foreign key (profile_id) references public.profiles(id);
alter table public.permanent_location_permissions    add constraint permanent_location_permissions_granted_by_fkey  foreign key (granted_by) references public.profiles(id);
alter table public.permanent_location_permissions    add constraint permanent_location_permissions_manager_id_fkey  foreign key (manager_id) references public.profiles(id);
alter table public.promotion_recommendations          add constraint promotion_recommendations_employee_id_fkey     foreign key (employee_id) references public.profiles(id);
alter table public.promotion_recommendations          add constraint promotion_recommendations_recommended_by_fkey  foreign key (recommended_by) references public.profiles(id);
alter table public.promotion_recommendations          add constraint promotion_recommendations_reviewed_by_fkey     foreign key (reviewed_by) references public.profiles(id);
alter table public.reschedule_requests               add constraint reschedule_requests_client_id_fkey    foreign key (client_id) references public.profiles(id);
alter table public.reschedule_requests               add constraint reschedule_requests_reviewed_by_fkey   foreign key (reviewed_by) references public.profiles(id);
alter table public.salary_records                    add constraint salary_records_employee_id_fkey        foreign key (employee_id) references public.profiles(id);
alter table public.service_employee_assignments      add constraint service_employee_assignments_assigned_by_fkey  foreign key (assigned_by) references public.profiles(id);
alter table public.service_employee_assignments      add constraint service_employee_assignments_employee_id_fkey  foreign key (employee_id) references public.profiles(id);
alter table public.staff_assignments                 add constraint staff_assignments_staff_id_fkey        foreign key (staff_id) references public.profiles(id);

-- 5. Update security-definer functions to accept text UIDs
create or replace function public.upsert_profile(
  p_id text,
  p_full_name text,
  p_email text,
  p_avatar_url text,
  p_role text default 'client'
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, role)
  values (p_id, p_full_name, p_email, p_avatar_url, p_role)
  on conflict (id) do update set
    full_name  = excluded.full_name,
    email      = excluded.email,
    avatar_url = excluded.avatar_url,
    role       = excluded.role;
end;
$$;

create or replace function public.insert_business_location(
  p_name text,
  p_address text,
  p_maps_url text,
  p_updated_by text,
  p_is_primary boolean default false
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.business_locations (name, address, maps_url, updated_by, is_primary)
  values (p_name, p_address, p_maps_url, p_updated_by, p_is_primary);
end;
$$;

create or replace function public.insert_location_update_request(
  p_name text,
  p_address text,
  p_maps_url text,
  p_requested_by text,
  p_reason text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.location_update_requests (name, address, maps_url, requested_by, reason)
  values (p_name, p_address, p_maps_url, p_requested_by, p_reason);
end;
$$;

create or replace function public.set_primary_location(p_id text)
returns void
language plpgsql
security definer
as $$
begin
  update public.business_locations set is_primary = false where is_primary = true;
  update public.business_locations set is_primary = true where id = p_id;
end;
$$;

create or replace function public.review_location_request(
  p_id uuid,
  p_status text,
  p_reviewed_by text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.location_update_requests
  set
    status = p_status,
    reviewed_by = p_reviewed_by,
    reviewed_at = now()
  where id = p_id;
end;
$$;
