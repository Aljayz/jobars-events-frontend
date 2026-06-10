-- ============================================================
-- Jobars Events — Security-definer helpers for Firebase auth
-- ============================================================
-- The app uses Firebase Auth, not Supabase Auth, so auth.uid()
-- is always null in RLS policies. These security-definer
-- functions bypass RLS for write operations.
-- ============================================================

-- Upsert a profile row (first login / session refresh)
create or replace function public.upsert_profile(
  p_id uuid,
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

-- Insert a business location (admin / manager with permission)
create or replace function public.insert_business_location(
  p_name text,
  p_address text,
  p_maps_url text,
  p_updated_by uuid,
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

-- Insert a location update request (manager)
create or replace function public.insert_location_update_request(
  p_name text,
  p_address text,
  p_maps_url text,
  p_requested_by uuid,
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

-- Set a business location as primary (unsets all others first)
create or replace function public.set_primary_location(p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.business_locations set is_primary = false where is_primary = true;
  update public.business_locations set is_primary = true where id = p_id;
end;
$$;

-- Update a location update request status (approve/deny)
create or replace function public.review_location_request(
  p_id uuid,
  p_status text,
  p_reviewed_by uuid
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
