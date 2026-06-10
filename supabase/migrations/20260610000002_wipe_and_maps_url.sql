-- ============================================================
-- Jobars Events — Wipe data + replace lat/lng with maps_url
-- ============================================================

-- 1. Wipe all data (preserve super-admin profiles)
SET session_replication_role = 'replica';

TRUNCATE public.messages CASCADE;
TRUNCATE public.chat_participants CASCADE;
TRUNCATE public.chat_rooms CASCADE;
TRUNCATE public.staff_assignments CASCADE;
TRUNCATE public.booking_services CASCADE;
TRUNCATE public.event_milestones CASCADE;
TRUNCATE public.approval_items CASCADE;
TRUNCATE public.event_ratings CASCADE;
TRUNCATE public.reschedule_requests CASCADE;
TRUNCATE public.meetup_bookings CASCADE;
TRUNCATE public.attendance_logs CASCADE;
TRUNCATE public.salary_records CASCADE;
TRUNCATE public.cash_advance_requests CASCADE;
TRUNCATE public.promotion_recommendations CASCADE;
TRUNCATE public.employee_records CASCADE;
TRUNCATE public.service_employee_assignments CASCADE;
TRUNCATE public.client_conversion_requests CASCADE;
TRUNCATE public.notifications CASCADE;
TRUNCATE public.contact_inquiries CASCADE;
TRUNCATE public.location_update_requests CASCADE;
TRUNCATE public.permanent_location_permissions CASCADE;
TRUNCATE public.events_bookings CASCADE;
TRUNCATE public.business_locations CASCADE;
TRUNCATE public.services CASCADE;

SET session_replication_role = 'origin';

-- 2. Reset business_settings to defaults
DELETE FROM public.business_settings WHERE id = 1;
INSERT INTO public.business_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3. Remove non-super-admin profiles
DELETE FROM public.profiles WHERE role != 'super-admin';

-- 4. Replace lat/lng with maps_url
ALTER TABLE public.business_locations
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  ADD COLUMN IF NOT EXISTS maps_url text;

ALTER TABLE public.location_update_requests
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  ADD COLUMN IF NOT EXISTS maps_url text;
