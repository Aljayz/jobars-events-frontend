-- ============================================================
-- Jobars Events — Add embed_url to business_locations
-- ============================================================

alter table public.business_locations
  add column if not exists embed_url text;
