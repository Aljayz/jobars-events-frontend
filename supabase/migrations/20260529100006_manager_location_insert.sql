-- ============================================================
-- Jobars Events — Allow managers with permanent permission to
-- insert into business_locations
-- ============================================================

drop policy if exists "manager_insert_locations" on public.business_locations;
create policy "manager_insert_locations" on public.business_locations
  for insert with check (
    exists (
      select 1 from public.permanent_location_permissions
      where manager_id = auth.uid() and is_active = true
    )
  );
